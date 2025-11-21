'use client'

import { Dispatch, type ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react'

import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
import { services } from '@/pages/Begleiter'
import { useLocation } from 'react-router-dom'

import { type Filters, menuItems } from '@/components/custom/filters'

import { filterMemorials, filterObituaries, filterProviders } from '@/lib/filtering'

export const country_options = ['german', 'austria', 'switzerland', ''] as const
export type CountryOptionsType = (typeof country_options)[number]

export const german_states_options = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'] as const
export type GermanStatesOptionsType = (typeof german_states_options)[number]

export const austria_states_options = ['Burgenland', 'Kärnten', 'Niederösterreich', 'Oberösterreich', 'Salzburg', 'Steiermark', 'Tirol', 'Vorarlberg', 'Wien'] as const
export type AustriaStatesOptionsType = (typeof austria_states_options)[number]

export const switzerland_states_options = [
  'Aargau',
  'Appenzell Ausserrhoden',
  'Appenzell Innerrhoden',
  'Basel-Landschaft',
  'Basel-Stadt',
  'Bern',
  'Freiburg (Fribourg)',
  'Genf (Genève)',
  'Glarus',
  'Graubünden (Grisons)',
  'Jura',
  'Luzern',
  'Neuenburg (Neuchâtel)',
  'Nidwalden',
  'Obwalden',
  'Schaffhausen',
  'Schwyz',
  'Solothurn',
  'St. Gallen',
  'Tessin (Ticino)',
  'Thurgau',
  'Uri',
  'Waadt (Vaud)',
  'Wallis (Valais)',
  'Zug',
  'Zürich',
] as const
export type SwitzerlandStatesOptionsType = (typeof switzerland_states_options)[number]

export const states_options = {
  german: german_states_options,
  austria: austria_states_options,
  switzerland: switzerland_states_options,
}
export type StatesOptionsType = {
  german: GermanStatesOptionsType
  austria: AustriaStatesOptionsType
  switzerland: SwitzerlandStatesOptionsType
}

export const gender_options = ['male', 'female', ''] as const
export type GenderOptionsType = (typeof gender_options)[number]

export const reason_of_death_options = ['naturalDeath', 'accident', 'suicide', 'homicide', 'unclear', ''] as const
export type ReasonOfDeathOptionsType = (typeof reason_of_death_options)[number]

export type MemorialValuesType = {
  dropdown: string
  firstName: string
  lastName: string
  country: CountryOptionsType
  state: GermanStatesOptionsType | AustriaStatesOptionsType | SwitzerlandStatesOptionsType | ''
  zip: string
  zipRadius: number
  gender: GenderOptionsType
  reasonOfDeath: ReasonOfDeathOptionsType
}

export type ObituariesValuesType = {
  dropdown: string
  firstName: string
  lastName: string
  country: CountryOptionsType
  state: GermanStatesOptionsType | AustriaStatesOptionsType | SwitzerlandStatesOptionsType | ''
  zip: string
  zipRadius: number
  gender: GenderOptionsType
  reasonOfDeath: ReasonOfDeathOptionsType
}

export type CompanionValuesType = {
  dropdown: string
  firstName: string
  lastName: string
  country: CountryOptionsType
  state: GermanStatesOptionsType | AustriaStatesOptionsType | SwitzerlandStatesOptionsType | ''
  zip: string
  zipRadius: number
}

export type AnimalValuesType = {
  dropdown: string
}

export type FiltersContextType = {
  memorialValues: MemorialValuesType
  setMemorialValues: Dispatch<SetStateAction<MemorialValuesType>>
  obituariesValues: ObituariesValuesType
  setObituariesValues: Dispatch<SetStateAction<ObituariesValuesType>>
  companionValues: CompanionValuesType
  setCompanionValues: Dispatch<SetStateAction<CompanionValuesType>>
  animalValues: AnimalValuesType
  setAnimalValues: Dispatch<SetStateAction<AnimalValuesType>>
  selectedFilter: Filters
  setSelectedFilter: Dispatch<SetStateAction<Filters>>

  memorialData: { isLoading: boolean; data: Database['public']['Tables']['dde_memorial_pages']['Row'][] }
  setMemorialData: Dispatch<SetStateAction<{ isLoading: boolean; data: Database['public']['Tables']['dde_memorial_pages']['Row'][] }>>
  obituariesData: { isLoading: boolean; data: Database['public']['Tables']['dde_obituaries']['Row'][] }
  setObituariesData: Dispatch<SetStateAction<{ isLoading: boolean; data: Database['public']['Tables']['dde_obituaries']['Row'][] }>>
  companionData: { isLoading: boolean; data: typeof services }
  setCompanionData: Dispatch<SetStateAction<{ isLoading: boolean; data: typeof services }>>

  filteredMemorialData: Database['public']['Tables']['dde_memorial_pages']['Row'][]
  filteredObituariesData: Database['public']['Tables']['dde_obituaries']['Row'][]
  filteredCompanionData: typeof services

  resetFilters: () => void
}

const FiltersContext = createContext<FiltersContextType | null>(null)

const defaultMemorialValues: MemorialValuesType = {
  dropdown: '',
  firstName: '',
  lastName: '',
  country: '',
  state: '',
  zip: '',
  zipRadius: 50,
  gender: '',
  reasonOfDeath: '',
}

const defaultObituariesValues: ObituariesValuesType = {
  dropdown: '',
  firstName: '',
  lastName: '',
  country: '',
  state: '',
  zip: '',
  zipRadius: 50,
  gender: '',
  reasonOfDeath: '',
}

const defaultCompanionValues: CompanionValuesType = {
  dropdown: '',
  firstName: '',
  lastName: '',
  country: '',
  state: '',
  zip: '',
  zipRadius: 50,
}

const defaultAnimalValues: AnimalValuesType = {
  dropdown: '',
}

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation()
  const { toast } = useToast()

  const [memorialValues, setMemorialValues] = useState(defaultMemorialValues)
  const [obituariesValues, setObituariesValues] = useState(defaultObituariesValues)
  const [companionValues, setCompanionValues] = useState(defaultCompanionValues)
  const [animalValues, setAnimalValues] = useState(defaultAnimalValues)

  const [selectedFilter, setSelectedFilter] = useState<Filters>(pathname === '/gedenkportal' ? 'memorial_portal' : pathname === '/traueranzeigen' ? 'obituaries' : pathname === '/begleiter' ? 'companion_in_difficult_times' : 'memorial_portal')

  const [memorialData, setMemorialData] = useState<FiltersContextType['memorialData']>({
    isLoading: true,
    data: [],
  })
  const [filteredMemorialData, setFilteredMemorialData] = useState<FiltersContextType['filteredMemorialData']>()

  const [obituariesData, setObituariesData] = useState<FiltersContextType['obituariesData']>({
    isLoading: true,
    data: [],
  })
  const [filteredObituariesData, setFilteredObituariesData] = useState<FiltersContextType['filteredObituariesData']>()

  const [companionData, setCompanionData] = useState<FiltersContextType['companionData']>({
    isLoading: false,
    data: services,
  })
  const [filteredCompanionData, setFilteredCompanionData] = useState<FiltersContextType['filteredCompanionData']>()

  useEffect(() => {
    setFilteredMemorialData(filterMemorials(memorialData.data, memorialValues))
  }, [memorialData, memorialValues])

  useEffect(() => {
    setFilteredObituariesData(filterObituaries(obituariesData.data, obituariesValues))
  }, [obituariesData, obituariesValues])

  useEffect(() => {
    setFilteredCompanionData(filterProviders(companionData.data, companionValues))
  }, [companionData, companionValues])

  const fetchMemorialPages = async () => {
    try {
      const { data, error } = await supabase.from('dde_memorial_pages').select('*').eq('is_published', true).eq('is_moderated', true).order('created_at', { ascending: false })

      if (error) throw error
      setMemorialData((prev) => ({ ...prev, data: data || [] }))
    } catch (error: any) {
      toast({
        title: 'Fehler beim Laden',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setMemorialData((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const fetchPublishedObituaries = async () => {
    try {
      const { data, error } = await supabase.from('dde_obituaries').select('*').eq('is_published', true).order('created_at', { ascending: false })

      if (error) throw error
      setObituariesData((prev) => ({ ...prev, data: data || [] }))
    } catch (error) {
      console.error('Error fetching obituaries:', error)
      toast({
        title: 'Fehler',
        description: 'Traueranzeigen konnten nicht geladen werden.',
        variant: 'destructive',
      })
    } finally {
      setObituariesData((prev) => ({ ...prev, isLoading: false }))
    }
  }

  useEffect(() => {
    setSelectedFilter(pathname === '/gedenkportal' ? 'memorial_portal' : pathname === '/traueranzeigen' ? 'obituaries' : pathname === '/begleiter' ? 'companion_in_difficult_times' : 'memorial_portal')
  }, [pathname])

  useEffect(() => {
    fetchMemorialPages()
    fetchPublishedObituaries()
  }, [])

  const resetFilters = () => {
    setMemorialValues(defaultMemorialValues)
    setObituariesValues(defaultObituariesValues)
    setCompanionValues(defaultCompanionValues)
    setAnimalValues(defaultAnimalValues)
    setSelectedFilter(menuItems[0].value)
  }

  const value: FiltersContextType = {
    memorialValues,
    setMemorialValues,
    obituariesValues,
    setObituariesValues,
    companionValues,
    setCompanionValues,
    animalValues,
    setAnimalValues,
    selectedFilter,
    setSelectedFilter,

    memorialData,
    setMemorialData,
    obituariesData,
    setObituariesData,
    companionData,
    setCompanionData,

    filteredMemorialData,
    filteredObituariesData,
    filteredCompanionData,

    resetFilters,
  }

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export const useFilters = () => {
  const context = useContext(FiltersContext)

  if (context === null) {
    throw new Error("useFilters can't be null")
  }

  return context
}
