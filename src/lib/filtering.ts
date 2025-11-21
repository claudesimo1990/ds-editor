import type { CompanionValuesType, MemorialValuesType, ObituariesValuesType } from '@/context/filters'
import type { Database } from '@/integrations/supabase/types'
import { services } from '@/pages/Begleiter'

export const filterMemorials = (data: Database['public']['Tables']['dde_memorial_pages']['Row'][], filters: MemorialValuesType) => {
  const { firstName, lastName, country, state, gender, reasonOfDeath, zip, zipRadius, dropdown } = filters

  return data.filter((entry) => {
    let matches = true

    // First & Last Name
    if (firstName) {
      matches = matches && entry.deceased_first_name.toLowerCase().includes(firstName.toLowerCase())
    }
    if (lastName) {
      matches = matches && entry.deceased_last_name.toLowerCase().includes(lastName.toLowerCase())
    }

    // Maiden name fallback
    if (firstName && !matches && entry.birth_maiden_name) {
      matches = entry.birth_maiden_name.toLowerCase().includes(firstName.toLowerCase())
    }

    // Country (birth_place OR death_place)
    if (country) {
      const c = country.toLowerCase()
      matches = matches && (entry.birth_place?.toLowerCase().includes(c) || entry.death_place?.toLowerCase().includes(c))
    }

    // State (from location string, best-effort)
    if (state) {
      matches = matches && entry.location?.toLowerCase().includes(state.toLowerCase())
    }

    // Gender
    if (gender) {
      const gernamGender = gender === 'male' ? 'männlich' : 'weiblich'
      matches = matches && entry.gender?.toLowerCase() === gernamGender.toLowerCase()
    }

    // Cause of death
    if (reasonOfDeath) {
      matches = matches && entry.cause_of_death?.toLowerCase() === reasonOfDeath.toLowerCase()
    }

    return matches
  })
}

export const filterObituaries = (data: Database['public']['Tables']['dde_obituaries']['Row'][], filters: ObituariesValuesType) => {
  const { firstName, lastName, country, state, gender, reasonOfDeath, zip, zipRadius, dropdown } = filters

  return data.filter((entry) => {
    let matches = true

    // First & Last Name
    if (firstName) {
      matches = matches && entry.deceased_first_name.toLowerCase().includes(firstName.toLowerCase())
    }
    if (lastName) {
      matches = matches && entry.deceased_last_name.toLowerCase().includes(lastName.toLowerCase())
    }

    // Additional name
    if (firstName && !matches && entry.deceased_additional_name) {
      matches = entry.deceased_additional_name.toLowerCase().includes(firstName.toLowerCase())
    }

    // Country (birth_place OR death_place OR last_residence)
    if (country) {
      const c = country.toLowerCase()
      matches = matches && (entry.birth_place?.toLowerCase().includes(c) || entry.death_place?.toLowerCase().includes(c) || entry.last_residence?.toLowerCase().includes(c))
    }

    // State (best-effort match)
    if (state) {
      matches = matches && entry.last_residence?.toLowerCase().includes(state.toLowerCase())
    }

    // Gender
    if (gender) {
      matches = matches && entry.gender?.toLowerCase() === gender.toLowerCase()
    }

    // Cause of death
    if (reasonOfDeath) {
      matches = matches && entry.cause_of_death?.toLowerCase() === reasonOfDeath.toLowerCase()
    }

    return matches
  })
}

export const filterProviders = (data: typeof services, filters: CompanionValuesType) => {
  const { firstName, lastName, country, state, zip, zipRadius, dropdown } = filters

  return data
    .map((category) => {
      const filteredProviders = category.providers.filter((provider) => {
        let matches = true

        // Provider name (split into first/last if needed)
        if (firstName) {
          matches = matches && provider.name.toLowerCase().includes(firstName.toLowerCase())
        }
        if (lastName) {
          matches = matches && provider.name.toLowerCase().includes(lastName.toLowerCase())
        }

        // Country
        if (country) {
          matches = matches && provider.location.toLowerCase().includes(country.toLowerCase())
        }

        // State
        if (state) {
          matches = matches && provider.location.toLowerCase().includes(state.toLowerCase())
        }

        return matches
      })

      return { ...category, providers: filteredProviders }
    })
    .filter((category) => category.providers.length > 0)
}
