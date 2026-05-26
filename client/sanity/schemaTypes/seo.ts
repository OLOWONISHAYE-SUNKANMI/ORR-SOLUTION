import { defineType, defineField } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO Metadata',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Title for search engines (50-60 characters recommended)',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      description: 'Description for search engines (150-160 characters recommended)',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'The preferred URL of this page to avoid duplicate content',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image shown when shared on social media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords for search engines',
    }),
    defineField({
      name: 'robots',
      title: 'Robots Indexing Options',
      type: 'string',
      description: 'Search engine indexing behavior',
      options: {
        list: [
          { title: 'Index, Follow (Default)', value: 'index, follow' },
          { title: 'Noindex, Nofollow', value: 'noindex, nofollow' },
          { title: 'Index, Nofollow', value: 'index, nofollow' },
          { title: 'Noindex, Follow', value: 'noindex, follow' },
        ],
      },
      initialValue: 'index, follow',
    }),
  ],
})
