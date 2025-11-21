import { useState } from 'react'
import { useFilters } from '@/context/filters'
import type { Database } from '@/integrations/supabase/types'
import { services } from '@/pages/Begleiter'
import { convertToObituaryData } from '@/pages/Traueranzeigen'
import { Calendar, Clock, Eye, Heart, Mail, MapPin, Phone, Share2, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ObituaryPreview } from '@/components/obituary/ObituaryPreview'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '../ui/button'

type CombinedSearchBlocksProps = {
  memorial_portal_data?: Database['public']['Tables']['dde_memorial_pages']['Row'][]
  obituaries_data?: Database['public']['Tables']['dde_obituaries']['Row'][]
  companion_in_difficult_times_data?: typeof services
  companions_animals_type?: []
}

export default function CombinedSearchBlocks({}: CombinedSearchBlocksProps) {
  const { selectedFilter, memorialValues, memorialData, filteredMemorialData, obituariesValues, obituariesData, filteredObituariesData, companionValues, companionData, filteredCompanionData } =
    useFilters()

   const [selectedItem, setSelectedItem] = useState(null)

  return (
    <div className='container py-12 px-4 mx-auto'>
      {selectedFilter === 'memorial_portal' && memorialValues?.dropdown && (
        <>
          {filteredMemorialData.length === 0 ? (
            <div className='text-center py-16 max-w-[1300px]'>
              <Heart className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-xl font-elegant text-foreground mb-2'>Keine Gedenkseiten gefunden</h3>
              <p className='text-muted-foreground mb-6'>Versuchen Sie andere Suchbegriffe oder wählen Sie eine andere Kategorie.</p>
              <Button asChild variant='outline'>
                <Link to='/gedenkseite/erstellen'>Erste Gedenkseite erstellen</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className='flex justify-between items-center mb-6 max-w-[1300px] mx-auto '>
                <p className='text-muted-foreground font-elegant'>
                  {filteredMemorialData.length} Gedenkseite
                  {filteredMemorialData.length !== 1 ? 'n' : ''} gefunden
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 max-w-[1300px] p-4 mx-auto border-4 border-double border-black">
              {filteredMemorialData?.map((memorial, memorialIndex) => {
                const isOpen = selectedItem === memorial.id;

                return (
                  <Card
                    key={memorial?.birth_date + memorial?.deceased_first_name + memorialIndex}
                    className="w-full h-full sm:px-6 sm:py-4 gap-2 flex flex-col transition-gentle hover:shadow-elegant group"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="w-full flex flex-col flex-1 gap-2">
                        <h3 className="hidden sm:flex text-lg font-memorial font-semibold text-foreground mb-2">
                          {memorial.deceased_first_name} {memorial.deceased_last_name}
                        </h3>

                        <div className="h-full flex flex-col sm:flex-row items-start gap-2">
                          <div className="w-full sm:w-40 min-w-40 h-48 sm:h-40 overflow-hidden relative rounded-lg">
                            {memorial.main_photo_url ? (
                              <img
                                src={memorial.main_photo_url}
                                alt={`${memorial.deceased_first_name} ${memorial.deceased_last_name}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-subtle flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                <Heart className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="h-full flex flex-col justify-between px-6 py-4 sm:px-0 sm:py-2">
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(memorial.birth_date).getFullYear()} -{" "}
                                {new Date(memorial.death_date).getFullYear()}
                              </span>

                              {memorial.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {memorial.location}
                                </span>
                              )}

                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {memorial.visitor_count || 0} Besucher
                              </span>
                            </div>

                            {memorial.memorial_text && (
                              <p className="text-muted-foreground font-elegant text-sm italic line-clamp-2">
                                "{memorial.memorial_text.slice(0, 100)}..."
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-fit min-w-[200px] flex flex-col justify-between gap-2">
                        <Button variant="default" size="sm" asChild>
                          <Link to={`/gedenkseite/${memorial.id}`}>
                            <Heart className="w-3 h-3 mr-1" />
                            Besuchen
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItem(isOpen ? null : memorial.id)}
                        >
                          {isOpen ? "Schließen" : "Info"}
                        </Button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-muted relative">
                        <button
                          onClick={() => setSelectedItem(null)}
                          className="absolute top-2 right-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          ✕
                        </button>
                        <h4 className="text-lg font-semibold mb-2">
                          Über {memorial.deceased_first_name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {memorial.memorial_text || "Keine weiteren Informationen."}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Geburtsdatum:</span>{" "}
                            {new Date(memorial.birth_date).toLocaleDateString("de-DE")}
                          </div>
                          <div>
                            <span className="font-medium">Todestag:</span>{" "}
                            {new Date(memorial.death_date).toLocaleDateString("de-DE")}
                          </div>
                          {memorial.location && (
                            <div className="sm:col-span-2">
                              <span className="font-medium">Ort:</span> {memorial.location}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            </>
          )}
        </>
      )}

      {selectedFilter === 'obituaries' && obituariesValues?.dropdown && (
        <>
          {filteredObituariesData.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground text-lg'>Derzeit sind keine Traueranzeigen veröffentlicht.</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min'>
              {filteredObituariesData.map((obituary) => {
                const obituaryData = convertToObituaryData(obituary)
                const isLandscape = obituaryData.orientation === 'landscape'

                return (
                  <div
                    key={obituary.id}
                    className={`
                    ${isLandscape ? 'md:col-span-2 lg:col-span-2 xl:col-span-2' : 'col-span-1'}
                    break-inside-avoid
                  `}
                  >
                    <Link to={`/traueranzeige/${obituary.id}`} className='block group'>
                      <div className='relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02]'>
                        {/* View Count Badge */}
                        <div className='absolute top-2 right-2 z-10'>
                          <Badge variant='secondary' className='text-xs bg-black/50 text-white border-none'>
                            {obituary.views_count} Aufrufe
                          </Badge>
                        </div>

                        {/* Obituary Preview - ohne scale um echte Größe zu zeigen */}
                        <div className='p-2'>
                          <ObituaryPreview obituary={obituaryData} previewMode='mobile' />
                        </div>

                        {/* Hover Overlay */}
                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                          <div className='bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300'>
                            <span className='text-sm font-medium text-foreground'>Traueranzeige ansehen</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {selectedFilter === 'companion_in_difficult_times' && companionValues?.dropdown && (
        <div className='space-y-12 max-w-[1300px] mx-auto'>
          {filteredCompanionData.map((service) => {
            const IconComponent = service.icon
            return (
              <div key={service.id}>
                <div className='flex items-center gap-3 mb-6'>
                  <IconComponent className='w-8 h-8 text-primary' />
                  <h3 className='text-2xl font-memorial font-semibold text-foreground'>{service.title}</h3>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {service.providers.map((provider, index) => (
                    <Card key={index} className='hover:shadow-elegant transition-gentle'>
                      <CardHeader>
                        <div className='flex justify-between items-start'>
                          <div>
                            <CardTitle className='font-memorial text-foreground'>{provider.name}</CardTitle>
                            <div className='flex items-center gap-1 mt-2'>
                              <Star className='w-4 h-4 text-yellow-500 fill-current' />
                              <span className='text-sm text-muted-foreground'>{provider.rating} / 5.0</span>
                            </div>
                          </div>
                          <Badge variant='secondary' className='text-xs'>
                            Zertifiziert
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className='space-y-4'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <MapPin className='w-4 h-4' />
                          <span>{provider.location}</span>
                        </div>

                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Clock className='w-4 h-4' />
                          <span>{provider.available}</span>
                        </div>

                        <div className='space-y-2'>
                          <h4 className='font-elegant font-medium text-foreground'>Leistungen:</h4>
                          <div className='flex flex-wrap gap-2'>
                            {provider.services.map((serviceItem, idx) => (
                              <Badge key={idx} variant='outline' className='text-xs'>
                                {serviceItem}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className='flex gap-2 pt-4'>
                          <Button size='sm' className='flex-1'>
                            <Phone className='w-4 h-4 mr-2' />
                            Anrufen
                          </Button>
                          <Button variant='outline' size='sm' className='flex-1'>
                            <Mail className='w-4 h-4 mr-2' />
                            E-Mail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedFilter === 'companions_animals' && <></>}
    </div>
  )
}
