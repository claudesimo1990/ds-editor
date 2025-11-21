import { useState } from 'react'

import { useFilters } from '@/context/filters'
import type { Database } from '@/integrations/supabase/types'
import { Heart, Plus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import CombinedSearchBlocks from '@/components/custom/combinedSearchBlocks'
import Filters from '@/components/custom/filters'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { filterMemorials } from '@/lib/filtering'

const Gedenkportal = () => {
  const [sortBy, setSortBy] = useState('neueste')
  const { memorialValues, memorialData } = useFilters()

  const sortOptions = [
    { value: 'neueste', label: 'Neueste zuerst' },
    { value: 'aelteste', label: 'Älteste zuerst' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'views', label: 'Meist besucht' },
  ]

  const sortedMemorials = [...filterMemorials(memorialData.data, memorialValues)].sort((a, b) => {
    switch (sortBy) {
      case 'neueste':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'aelteste':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'name':
        const nameA = `${a.deceased_first_name} ${a.deceased_last_name}`
        const nameB = `${b.deceased_first_name} ${b.deceased_last_name}`
        return nameA.localeCompare(nameB)
      case 'views':
        return (b.visitor_count || 0) - (a.visitor_count || 0)
      default:
        return 0
    }
  })

  if (memorialData.isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <Heart className='h-12 w-12 text-primary mx-auto mb-4 animate-pulse' />
          <p className='text-muted-foreground font-elegant'>Lade Gedenkseiten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background relative '>
      {/* Subtle page ornaments */}
      <div className='memorial-page-ornament top-left' />
      <div className='memorial-page-ornament top-right' />
      <div className='memorial-page-ornament bottom-left' />
      <div className='memorial-page-ornament bottom-right' />
      {/* Hero Section */}
      <section className='relative px-4 bg-gradient-to-b from-primary/5 to-background '>
        <div className='container mx-auto max-w-[1300px] text-center gedenkportalBG p-8'>
          <h1 className='text-4xl md:text-5xl font-memorial text-white font-bold text-foreground mt-24 mb-4'>Bürgerradar</h1>
          <p className='text-lg text-muted-foreground mb-8 text-white max-w-2xl mx-auto font-elegant'>
            Ein Ort der Erinnerung und des Gedenkens. Hier finden Sie liebevoll gestaltete Gedenkseiten und können Kerzen anzünden oder Kondolenzen hinterlassen.
          </p>
          <div className='flex items-center justify-center gap-6 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2 text-white'>
              <Heart className='w-4 h-4 text-primary text-white' />
              <span>{memorialData.data.length} Gedenkseiten</span>
            </div>
            <div className='flex items-center gap-2 text-white'>
              <Users className='w-4 h-4 text-primary text-white' />
              <span>{memorialData.data.reduce((sum, m) => sum + (m.visitor_count || 0), 0)} Besucher</span>
            </div>
          </div>
        </div>
      </section>
      {/* Filter and Search */}
      <section className='py-8 px-4 bg-muted/30'>
        <div className='flex flex-col mx-auto max-w-[1300px] gap-4'>
          <Filters />
          <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
            <div className='w-full sm:w-fit flex flex-col md:flex-row gap-4 flex-1'>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-full sm:w-48'>
                  <SelectValue placeholder='Sortieren nach' />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button asChild className='w-full sm:w-fit shadow-elegant'>
              <Link to='/gedenkseite/erstellen'>
                <Plus className='w-4 h-4 mr-2' />
                Gedenkseite erstellen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Obituary Grid */}
      <CombinedSearchBlocks />

      {/* Call to Action */}

      <section className='py-16 px-4 bg-gradient-to-b from-background to-primary/5'>
        <div className='container mx-auto max-w-[1300px] text-center'>
          <Heart className='w-16 h-16 text-primary mx-auto mb-6' />
          <h2 className='text-3xl font-memorial font-bold text-foreground mb-4'>Eine Gedenkseite erstellen</h2>
          <p className='text-lg text-muted-foreground mb-8 font-elegant'>
            Ehren Sie das Andenken Ihrer Liebsten mit einer würdevollen Gedenkseite. Besucher können Kerzen anzünden und Kondolenzen hinterlassen.
          </p>
          <Button asChild size='lg' className='shadow-elegant'>
            <Link to='/gedenkseite/erstellen'>
              <Plus className='w-5 h-5 mr-2' />
              Gedenkseite erstellen
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Gedenkportal
