import {defineType, defineField} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title.en'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'localizedString',
      description: 'e.g. STRATEGY, OPERATIONS, INNOVATION',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'tags',
      title: 'Tags / Categories',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'localizedBlock',
    }),
    defineField({
      name: 'button1Text',
      title: 'Button 1 Text',
      type: 'localizedString',
    }),
    defineField({
      name: 'button2Text',
      title: 'Button 2 Text',
      type: 'localizedString',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this post in the featured/hero section of the blog page',
      initialValue: false,
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO Metadata',
      type: 'seo',
    }),
  ],
})

