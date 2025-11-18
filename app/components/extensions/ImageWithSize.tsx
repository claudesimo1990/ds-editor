import Image from '@tiptap/extension-image';

export const ImageWithSize = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('width');
          const style = element.getAttribute('style');
          if (style && style.includes('width:')) {
            const match = style.match(/width:\s*([^;]+)/);
            if (match) return match[1].trim();
          }
          return width;
        },
        renderHTML: attributes => {
          return {};
        },
      },
      height: {
        default: null,
        parseHTML: element => {
          const height = element.getAttribute('height');
          const style = element.getAttribute('style');
          if (style && style.includes('height:')) {
            const match = style.match(/height:\s*([^;]+)/);
            if (match) return match[1].trim();
          }
          return height;
        },
        renderHTML: attributes => {
          return {};
        },
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {};
          }
          return {
            style: attributes.style,
          };
        },
      },
    };
  },
});

