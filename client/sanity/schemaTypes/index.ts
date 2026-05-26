import { type SchemaTypeDefinition } from 'sanity'
import { landingPage } from './landingPage'
import { post } from './post'
import { resourcesPage } from './resourcesPage'
import { engagementPage } from './engagementPage'
import { localizedString, localizedText, localizedBlock } from './localizedFields'
import { seo } from './seo'
import { dynamicPage } from './dynamicPage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    localizedString,
    localizedText,
    localizedBlock,
    seo,
    landingPage,
    post,
    resourcesPage,
    engagementPage,
    dynamicPage,
  ],
}

