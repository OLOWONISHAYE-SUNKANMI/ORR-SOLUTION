import { defineType, defineField } from 'sanity'

export const dynamicPage = defineType({
  name: 'dynamicPage',
  title: 'Dynamic Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title.en' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'templateType',
      title: 'Page Template Type',
      type: 'string',
      options: {
        list: [
          { title: 'Landing Page Template', value: 'landing' },
          { title: 'Service Page Template', value: 'service' },
          { title: 'About Page Template', value: 'about' },
          { title: 'Default/Custom Template', value: 'default' },
        ],
      },
      initialValue: 'default',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'published',
      title: 'Published Status',
      type: 'boolean',
      description: 'Whether this page is publicly visible on the site',
      initialValue: true,
    }),
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        { name: 'heading', type: 'localizedString', title: 'Hero Heading' },
        { name: 'subheading', type: 'localizedText', title: 'Hero Subheading' },
        { name: 'image', type: 'image', title: 'Hero Image', options: { hotspot: true } },
        { name: 'buttonText', type: 'localizedString', title: 'Primary Button Text' },
        { name: 'buttonLink', type: 'string', title: 'Primary Button Link' },
        { name: 'button2Text', type: 'localizedString', title: 'Secondary Button Text' },
        { name: 'button2Link', type: 'string', title: 'Secondary Button Link' },
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Content Blocks / Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroBlock',
          title: 'Hero Block',
          fields: [
            { name: 'heading', type: 'localizedString', title: 'Heading' },
            { name: 'subheading', type: 'localizedText', title: 'Subheading' },
            { name: 'image', type: 'image', title: 'Image', options: { hotspot: true } },
            { name: 'buttonText', type: 'localizedString', title: 'Button Text' },
            { name: 'buttonLink', type: 'string', title: 'Button Link' },
          ],
        },
        {
          type: 'object',
          name: 'imageText',
          title: 'Image & Text Block',
          fields: [
            { name: 'heading', type: 'localizedString', title: 'Heading' },
            { name: 'text', type: 'localizedBlock', title: 'Rich Text Content' },
            { name: 'image', type: 'image', title: 'Image', options: { hotspot: true } },
            { name: 'reversed', type: 'boolean', title: 'Reverse Layout (Image on Right)', initialValue: false },
          ],
        },
        {
          type: 'object',
          name: 'cta',
          title: 'Call to Action (CTA)',
          fields: [
            { name: 'title', type: 'localizedString', title: 'Title' },
            { name: 'subtitle', type: 'localizedText', title: 'Subtitle' },
            { name: 'buttonText', type: 'localizedString', title: 'Button Text' },
            { name: 'link', type: 'string', title: 'Link' },
          ],
        },
        {
          type: 'object',
          name: 'features',
          title: 'Feature Cards Block',
          fields: [
            { name: 'blockHeading', type: 'localizedString', title: 'Block Heading' },
            { name: 'blockSubheading', type: 'localizedText', title: 'Block Subheading' },
            {
              name: 'cards',
              type: 'array',
              title: 'Feature Cards',
              of: [
                {
                  type: 'object',
                  name: 'card',
                  title: 'Card',
                  fields: [
                    { name: 'title', type: 'localizedString', title: 'Card Title' },
                    { name: 'description', type: 'localizedText', title: 'Card Description' },
                    { name: 'icon', type: 'string', title: 'Lucide Icon Name (e.g. Shield, Award, Zap, HelpCircle)' },
                    { name: 'link', type: 'string', title: 'Card Link (Optional)' },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'object',
          name: 'textBlock',
          title: 'Rich Content Block',
          fields: [
            { name: 'heading', type: 'localizedString', title: 'Block Heading (Optional)' },
            { name: 'body', type: 'localizedBlock', title: 'Rich Text Body' },
          ],
        },
        {
          type: 'object',
          name: 'embeddedMedia',
          title: 'Embedded Media Block',
          fields: [
            { name: 'title', type: 'localizedString', title: 'Media Title' },
            { name: 'mediaUrl', type: 'url', title: 'Media URL (YouTube/Vimeo/etc.)' },
            { name: 'caption', type: 'localizedText', title: 'Caption' },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO Metadata',
      type: 'seo',
    }),
  ],
})
