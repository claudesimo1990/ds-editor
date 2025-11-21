import { useFilters } from '@/context/filters'
import { ObituaryData } from '@/types/obituary'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import CombinedSearchBlocks from '@/components/custom/combinedSearchBlocks'
import Filters from '@/components/custom/filters'
import { Button } from '@/components/ui/button'

import { filterObituaries } from '@/lib/filtering'

interface DatabaseObituary {
  id: string
  deceased_first_name: string
  deceased_last_name: string
  deceased_additional_name?: string
  birth_date: string
  death_date: string
  location_date?: string
  trauerspruch?: string
  introduction?: string
  main_text?: string
  side_texts?: string
  additional_texts?: string
  last_residence?: string
  background_image?: string
  symbol_image?: string
  font_family: string
  frame_style: string
  color_theme: string
  orientation: string
  photo_url?: string
  text_align: string
  line_height: number
  letter_spacing: number
  custom_color?: string
  background_opacity: number
  views_count: number
  is_published: boolean
  created_at: string
}

export const convertToObituaryData = (dbObituary: DatabaseObituary): ObituaryData => ({
  type: 'todesanzeige',
  format: '182x100',
  deceased: {
    firstName: dbObituary.deceased_first_name,
    lastName: dbObituary.deceased_last_name,
    additionalName: dbObituary.deceased_additional_name || '',
    birthDate: dbObituary.birth_date,
    deathDate: dbObituary.death_date,
  },
  texts: {
    trauerspruch: dbObituary.trauerspruch || '',
    introduction: dbObituary.introduction || '',
    mainText: dbObituary.main_text || '',
    sideTexts: dbObituary.side_texts || '',
    additionalTexts: dbObituary.additional_texts || '',
    locationDate: dbObituary.location_date || '',
    lastResidence: dbObituary.last_residence || '',
  },
  backgroundImage: dbObituary.background_image || '',
  symbolImage: dbObituary.symbol_image || '',
  fontFamily: dbObituary.font_family as 'memorial' | 'serif' | 'sans-serif',
  frameStyle: dbObituary.frame_style as 'none' | 'simple' | 'double' | 'elegant',
  colorTheme: dbObituary.color_theme as 'light' | 'dark' | 'warm',
  orientation: dbObituary.orientation as 'portrait' | 'landscape',
  photoUrl: dbObituary.photo_url || '',
  textAlign: dbObituary.text_align as 'left' | 'center' | 'right',
  lineHeight: dbObituary.line_height,
  letterSpacing: dbObituary.letter_spacing,
  customColor: dbObituary.custom_color || '',
  backgroundOpacity: dbObituary.background_opacity * 100,
})

const Traueranzeigen = () => {
  const { obituariesValues, obituariesData } = useFilters()

  const filteredObituaries = filterObituaries(obituariesData.data, obituariesValues)

  if (obituariesData.isLoading) {
    return (
      <div className='min-h-screen bg-gradient-subtle py-12'>
        <div className='container mx-auto px-4'>
          <div className='text-center'>
            <div className='animate-pulse'>
              <div className='h-8 bg-muted rounded w-64 mx-auto mb-4'></div>
              <div className='h-4 bg-muted rounded w-96 mx-auto'></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-subtle py-12'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-4xl font-memorial font-bold text-foreground mb-4'>Traueranzeigen</h1>
          <p className='text-lg text-muted-foreground mb-8 max-w-2xl mx-auto'>
            Hier finden Sie alle veröffentlichten Traueranzeigen. Gedenken Sie an die Verstorbenen und teilen Sie Ihre Anteilnahme mit den Angehörigen.
          </p>

          <Button asChild size='lg' className='shadow-elegant'>
            <Link to='/traueranzeigen/erstellen'>
              <Plus className='w-5 h-5 mr-2' />
              Traueranzeige erstellen
            </Link>
          </Button>
        </div>

        <div className='my-12'>
          <Filters />
        </div>

        {/* Obituaries Masonry Grid */}
        <CombinedSearchBlocks />
      </div>
    </div>
  )
}

export default Traueranzeigen
