export default {
  editor: {
    label: {
      en: 'Moodboard - Community 2025',
    },
    icon: 'fontawesome/solid/images',
  },
  properties: {
    items: {
      label: { en: 'Moodboard items' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        {
          id: '1',
          imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
          description: 'Dream destination: Iceland waterfalls',
          url: '/projects/1',
          authorName: 'Alex',
          authorAvatar: 'https://i.pravatar.cc/80?img=1',
        },
        {
          id: '2',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
          description: 'Beach vibes - Bali 2025',
          url: '/projects/2',
          authorName: 'Jordan',
          authorAvatar: 'https://i.pravatar.cc/80?img=2',
        },
        {
          id: '3',
          imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
          description: 'Mountain escape - Swiss Alps',
          url: '/projects/3',
          authorName: 'Sam',
          authorAvatar: 'https://i.pravatar.cc/80?img=3',
        },
        {
          id: '4',
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          description: 'Sunset in the Dolomites',
          url: '/projects/4',
          authorName: 'Morgan',
          authorAvatar: 'https://i.pravatar.cc/80?img=4',
        },
        {
          id: '5',
          imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
          description: 'Northern lights bucket list',
          url: '/projects/5',
          authorName: 'Casey',
          authorAvatar: 'https://i.pravatar.cc/80?img=5',
        },
      ],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item?.authorName || item?.description || item?.title || `Item ${item?.id ?? '?'}`;
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: '',
            imageUrl: '',
            description: '',
            url: '',
            authorName: '',
            authorAvatar: '',
          },
          options: {
            item: {
              id: { label: { en: 'ID' }, type: 'Text' },
              imageUrl: { label: { en: 'Image URL' }, type: 'Text' },
              description: { label: { en: 'Description' }, type: 'Text' },
              url: { label: { en: 'Link URL (on click)' }, type: 'Text' },
              authorName: { label: { en: 'Community member name' }, type: 'Text' },
              authorAvatar: { label: { en: 'Member avatar URL' }, type: 'Text' },
            },
          },
        },
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array with: id, imageUrl, description, url, authorName, authorAvatar. Optional: x, y, rotation for layout.',
      },
      /* wwEditor:end */
    },
    itemsIdFormula: {
      label: { en: 'ID field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.items) && content.items.length > 0 ? content.items[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['id']" },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content?.items) || !content?.items?.length || !boundProps?.items,
    },
    itemsImageFormula: {
      label: { en: 'Image URL field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.items) && content.items.length > 0 ? content.items[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['imageUrl'] ?? context.mapping?.['image']" },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content?.items) || !content?.items?.length || !boundProps?.items,
    },
    itemsDescriptionFormula: {
      label: { en: 'Description field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.items) && content.items.length > 0 ? content.items[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['description']" },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content?.items) || !content?.items?.length || !boundProps?.items,
    },
    itemsUrlFormula: {
      label: { en: 'Link URL field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.items) && content.items.length > 0 ? content.items[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['url'] ?? context.mapping?.['linkUrl'] ?? context.mapping?.['link']" },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content?.items) || !content?.items?.length || !boundProps?.items,
    },
    itemsAuthorNameFormula: {
      label: { en: 'Member name field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.items) && content.items.length > 0 ? content.items[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['authorName'] ?? context.mapping?.['author'] ?? context.mapping?.['name']" },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content?.items) || !content?.items?.length || !boundProps?.items,
    },
    itemsAuthorAvatarFormula: {
      label: { en: 'Member avatar field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content?.items) && content.items.length > 0 ? content.items[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['authorAvatar'] ?? context.mapping?.['avatar']" },
      hidden: (content, sidepanelContent, boundProps) =>
        !Array.isArray(content?.items) || !content?.items?.length || !boundProps?.items,
    },
    openInNewTab: {
      label: { en: 'Open URL in new tab' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
      /* wwEditor:start */
      propertyHelp: 'To open the link on click: add an Open URL or Go to page action to the On card click trigger and set the URL to the trigger\'s event.url. Use this toggle as your new-tab preference when configuring that action.',
      /* wwEditor:end */
    },
    allowReposition: {
      label: { en: 'Allow drag to reposition' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
    },
    cardWidth: {
      label: { en: 'Card width' },
      type: 'Length',
      section: 'settings',
      defaultValue: 200,
    },
    imageFit: {
      label: { en: 'Image fit' },
      type: 'TextSelect',
      section: 'style',
      options: {
        options: [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
          { value: 'fill', label: 'Fill' },
          { value: 'none', label: 'None' },
        ],
      },
      defaultValue: 'cover',
    },
    titleFontSize: {
      label: { en: 'Title font size' },
      type: 'Length',
      section: 'style',
      defaultValue: 16,
    },
    descriptionFontSize: {
      label: { en: 'Description font size' },
      type: 'Length',
      section: 'style',
      defaultValue: 14,
    },
    boardMinHeight: {
      label: { en: 'Board min height' },
      type: 'Length',
      section: 'settings',
      defaultValue: 700,
    },
    boardBackground: {
      label: { en: 'Board background' },
      type: 'Color',
      section: 'style',
      defaultValue: '#e8e4df',
    },
  },
  triggerEvents: [
    { name: 'item-click', label: { en: 'On card click' }, event: { item: null, url: null } },
    { name: 'position-change', label: { en: 'On card repositioned' }, event: { item: null, x: 0, y: 0, rotation: 0 } },
    { name: 'initial-positions', label: { en: 'On initial random layout' }, event: { positions: [] } },
  ],
};
