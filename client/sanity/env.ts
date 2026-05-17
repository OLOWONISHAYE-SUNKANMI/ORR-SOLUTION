export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-10'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
  'production'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
  '2jqm6m49'
)

export const token = process.env.SANITY_API_TOKEN

export const useCdn = false

function assertValue<T>(v: T | undefined, errorMessage: string, fallback?: T): T {
  if (v === undefined) {
    if (fallback) {
      return fallback;
    }
    throw new Error(errorMessage)
  }

  return v
}
