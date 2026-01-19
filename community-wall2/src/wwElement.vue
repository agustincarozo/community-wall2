<template>
  <div
    ref="boardRef"
    class="moodboard"
    :style="boardStyle"
  >
    <div
      v-for="item in displayItems"
      :key="item.id"
      class="moodboard__card"
      :class="{ 'is-dragging': dragging?.id === item.id, 'no-drag': !allowReposition }"
      :style="cardStyle(item)"
      @mousedown="(e) => allowReposition && startDrag(e, item, 'mouse')"
      @touchstart="(e) => allowReposition && startDrag(e, item, 'touch')"
      @click="!allowReposition && onCardClick(item)"
    >
      <div class="moodboard__card-image-wrap">
        <img
          v-if="item.imageUrl"
          :src="item.imageUrl"
          :alt="item.description || ''"
          class="moodboard__card-image"
        />
        <div v-else class="moodboard__card-placeholder">🖼</div>
      </div>
      <div class="moodboard__card-author">
        <div class="moodboard__card-avatar" :style="avatarStyle(item)">
          <img v-if="item.authorAvatar" :src="item.authorAvatar" :alt="item.authorName || ''" />
          <span v-else class="moodboard__avatar-initials">{{ initials(item.authorName) }}</span>
        </div>
        <span class="moodboard__card-name">{{ item.authorName || 'Community member' }}</span>
      </div>
      <p v-if="item.description" class="moodboard__card-desc">{{ item.description }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';

export default {
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    /* wwEditor:start */
    const isEditing = computed(() => props.wwEditorState?.isEditing ?? false);
    /* wwEditor:end */

    const boardRef = ref(null);
    const layoutRef = ref({});
    const dragging = ref(null);

    const resolveMappingFormula =
      typeof wwLib !== 'undefined' && wwLib?.wwFormula?.useFormula
        ? wwLib.wwFormula.useFormula().resolveMappingFormula
        : null;

    const processedItems = computed(() => {
      const items = Array.isArray(props.content?.items) ? props.content.items : [];
      if (items.length === 0) return [];

      return items.map((item, i) => {
        const id =
          resolveMappingFormula?.(props.content?.itemsIdFormula, item) ??
          item?.id ??
          `item-${i}`;
        const imageUrl =
          resolveMappingFormula?.(props.content?.itemsImageFormula, item) ??
          item?.imageUrl ??
          item?.image ??
          '';
        const description =
          resolveMappingFormula?.(props.content?.itemsDescriptionFormula, item) ??
          item?.description ??
          '';
        const url =
          resolveMappingFormula?.(props.content?.itemsUrlFormula, item) ??
          item?.url ??
          item?.linkUrl ??
          item?.link ??
          '';
        const authorName =
          resolveMappingFormula?.(props.content?.itemsAuthorNameFormula, item) ??
          item?.authorName ??
          item?.author ??
          item?.name ??
          '';
        const authorAvatar =
          resolveMappingFormula?.(props.content?.itemsAuthorAvatarFormula, item) ??
          item?.authorAvatar ??
          item?.avatar ??
          '';

        return {
          id: String(id),
          imageUrl: String(imageUrl),
          description: String(description),
          url: String(url),
          authorName: String(authorName),
          authorAvatar: String(authorAvatar),
          originalItem: item,
        };
      });
    });

    function ensureLayout() {
      const list = processedItems.value;
      const layout = layoutRef.value;
      const next = { ...layout };
      const pending = [];

      for (const p of list) {
        if (next[p.id]) continue;
        const o = p.originalItem ?? {};
        const hasStored =
          [o.x, o.y, o.rotation].every(
            (n) => typeof n === 'number' && Number.isFinite(n)
          );
        if (hasStored) {
          next[p.id] = { x: o.x, y: o.y, rotation: o.rotation };
        } else {
          const x = 5 + Math.random() * 72;
          const y = 5 + Math.random() * 72;
          const rotation = -5 + Math.random() * 10;
          next[p.id] = { x, y, rotation };
          pending.push({ id: p.id, x, y, rotation });
        }
      }

      layoutRef.value = next;
      if (pending.length) {
        nextTick(() => {
          emit('trigger-event', { name: 'initial-positions', event: { positions: pending } });
        });
      }
    }

    watch(processedItems, () => ensureLayout(), { immediate: true });

    const displayItems = computed(() => {
      const list = processedItems.value;
      const layout = layoutRef.value;
      return list.map((p) => {
        const pos = layout[p.id] ?? { x: 10, y: 10, rotation: 0 };
        return { ...p, x: pos.x, y: pos.y, rotation: pos.rotation };
      });
    });

    const allowReposition = computed(() => props.content?.allowReposition !== false);

    function toLength(val, fallback = 16) {
      if (val == null || val === '') return `${fallback}px`;
      if (typeof val === 'number' && !isNaN(val)) return `${val}px`;
      if (typeof val === 'string') {
        const s = String(val).trim();
        if (/^-?\d+(\.\d+)?(px|rem|em|%)$/i.test(s)) return s;
        if (/^-?\d+(\.\d+)?$/.test(s)) return `${s}px`;
        const n = parseFloat(s);
        if (!isNaN(n)) return `${n}px`;
      }
      if (typeof val === 'object' && val !== null && (val.value != null || val.unit != null))
        return `${val.value ?? fallback}${val.unit || 'px'}`;
      return `${fallback}px`;
    }

    const boardStyle = computed(() => ({
      '--board-bg': props.content?.boardBackground ?? '#e8e4df',
      '--board-min-height': toLength(props.content?.boardMinHeight, 700),
      '--card-width': toLength(props.content?.cardWidth, 200),
      '--image-fit': props.content?.imageFit ?? 'cover',
      '--title-font-size': toLength(props.content?.titleFontSize, 16),
      '--description-font-size': toLength(props.content?.descriptionFontSize, 14),
    }));

    const cardStyle = (item) => ({
      left: `${item.x}%`,
      top: `${item.y}%`,
      transform: `rotate(${item.rotation}deg)`,
      width: 'var(--card-width)',
    });

    const initials = (name) => {
      if (!name || typeof name !== 'string') return '?';
      return (name.trim().split(/\s+/).map((s) => (s || '')[0]).join('').toUpperCase() || '?').slice(0, 2);
    };

    const avatarStyle = (item) => {
      const c = ['#e8b4bc', '#c9a0dc', '#87ceeb', '#98d8a8', '#f7dc6f'];
      const i = (item?.id ?? '').split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
      return { backgroundColor: c[Math.abs(i) % c.length] };
    };

    let selectedVariable = null;
    if (typeof wwLib !== 'undefined' && wwLib?.wwVariable?.useComponentVariable) {
      selectedVariable = wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'selectedItem',
        type: 'object',
        defaultValue: null,
      });
    }
    const setSelected = (v) => selectedVariable?.setValue?.(v);

    const onCardClick = (item) => {
      const rawItem = item?.originalItem ?? item;
      const url = (item?.url || '').trim() || null;
      setSelected(rawItem);
      emit('trigger-event', { name: 'item-click', event: { item: rawItem, url } });
    };

    function getCoords(e, kind) {
      if (kind === 'touch') {
        const t = e.touches?.[0] ?? e.changedTouches?.[0];
        return t ? { x: t.clientX, y: t.clientY } : null;
      }
      return { x: e.clientX, y: e.clientY };
    }

    function startDrag(e, item, kind) {
      if (dragging.value) return;
      const coords = getCoords(e, kind);
      if (!coords) return;
      e?.preventDefault?.();

      const layout = layoutRef.value[item.id] ?? { x: 10, y: 10, rotation: 0 };
      const board = boardRef.value;
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const cardW = parseFloat(toLength(props.content?.cardWidth, 200)) || 200;
      const maxX = Math.max(0, 100 - (cardW / rect.width) * 100);
      const maxY = Math.max(0, 100 - ((cardW * 0.75 + 100) / rect.height) * 100);

      let hasMoved = false;
      const state = {
        id: item.id,
        item,
        startX: coords.x,
        startY: coords.y,
        startLeft: layout.x,
        startTop: layout.y,
        rotation: layout.rotation,
        hasMoved: () => hasMoved,
        setMoved: () => { hasMoved = true; },
        maxX,
        maxY,
        rect,
      };
      dragging.value = state;

      const win = typeof wwLib !== 'undefined' && wwLib?.getFrontWindow ? wwLib.getFrontWindow() : null;
      if (!win) return;

      const onMove = (ev) => {
        const c = getCoords(ev, kind);
        if (!c) return;
        const dx = c.x - state.startX;
        const dy = c.y - state.startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) state.setMoved();
        const r = board.getBoundingClientRect();
        const newLeft = Math.max(0, Math.min(state.maxX, state.startLeft + (dx / r.width) * 100));
        const newTop = Math.max(0, Math.min(state.maxY, state.startTop + (dy / r.height) * 100));
        layoutRef.value = {
          ...layoutRef.value,
          [state.id]: { x: newLeft, y: newTop, rotation: state.rotation },
        };
        if (kind === 'touch') ev?.preventDefault?.();
      };

      const onUp = (ev) => {
        if (kind === 'touch') {
          win.removeEventListener('touchmove', onMove);
          win.removeEventListener('touchend', onUp);
        } else {
          win.removeEventListener('mousemove', onMove);
          win.removeEventListener('mouseup', onUp);
        }
        const wasDrag = state.hasMoved();
        dragging.value = null;
        if (wasDrag) {
          const pos = layoutRef.value[state.id] ?? { x: state.startLeft, y: state.startTop, rotation: state.rotation };
          emit('trigger-event', {
            name: 'position-change',
            event: {
              item: state.item?.originalItem ?? state.item,
              x: pos.x,
              y: pos.y,
              rotation: pos.rotation,
            },
          });
        } else {
          onCardClick(state.item);
        }
      };

      if (kind === 'touch') {
        win.addEventListener('touchmove', onMove, { passive: false });
        win.addEventListener('touchend', onUp, { once: true });
      } else {
        win.addEventListener('mousemove', onMove);
        win.addEventListener('mouseup', onUp, { once: true });
      }
    }

    return {
      boardRef,
      displayItems,
      dragging,
      allowReposition,
      boardStyle,
      cardStyle,
      initials,
      avatarStyle,
      startDrag,
      onCardClick,
      /* wwEditor:start */
      isEditing,
      /* wwEditor:end */
    };
  },
};
</script>

<style lang="scss" scoped>
.moodboard {
  position: relative;
  min-height: var(--board-min-height, 700px);
  width: 100%;
  background: var(--board-bg, #e8e4df);
  overflow: visible;
}

.moodboard__card {
  position: absolute;
  background: #fff;
  border-radius: 4px;
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  cursor: grab;
  transition: box-shadow 0.2s;

  &.no-drag {
    cursor: pointer;
  }

  &:hover {
    box-shadow: 3px 6px 16px rgba(0, 0, 0, 0.2);
  }

  &.is-dragging {
    cursor: grabbing;
    z-index: 100;
    transition: none;
    box-shadow: 4px 8px 24px rgba(0, 0, 0, 0.25);
  }
}

.moodboard__card-image-wrap {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #f0f0f0;
}

.moodboard__card-image {
  width: 100%;
  height: 100%;
  object-fit: var(--image-fit, cover);
  display: block;
}

.moodboard__card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #bbb;
}

.moodboard__card-author {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 0;
  background: #fff;
}

.moodboard__card-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.moodboard__avatar-initials {
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
}

.moodboard__card-name {
  font-size: var(--title-font-size, 0.85rem);
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.moodboard__card-desc {
  margin: 0;
  padding: 8px 12px 12px;
  font-size: var(--description-font-size, 0.8rem);
  line-height: 1.35;
  color: #444;
  background: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
