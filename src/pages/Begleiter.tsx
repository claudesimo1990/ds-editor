import { useFilters } from '@/context/filters'
import { Award, Heart, Mail, Phone, Users } from 'lucide-react'

import CombinedSearchBlocks from '@/components/custom/combinedSearchBlocks'
import Filters from '@/components/custom/filters'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { filterProviders } from '@/lib/filtering'

export const services = [
  {
    id: 1,
    title: 'Bestattungsunternehmen',
    description: 'Professionelle Bestattungsdienstleister in Ihrer Nähe',
    icon: Heart,
    providers: [
      {
        name: 'Bestattungen Schmidt',
        location: 'München',
        phone: '+49 89 12345678',
        email: 'info@bestattungen-schmidt.de',
        rating: 4.8,
        services: ['Erdbestattung', 'Feuerbestattung', 'Seebestattung'],
        available: '24/7',
      },
      {
        name: 'Pietät Weber',
        location: 'Berlin',
        phone: '+49 30 87654321',
        email: 'kontakt@pietaet-weber.de',
        rating: 4.9,
        services: ['Erdbestattung', 'Feuerbestattung', 'Waldbestattung'],
        available: '24/7',
      },
    ],
  },
  {
    id: 2,
    title: 'Trauerredner',
    description: 'Einfühlsame Redner für die Trauerfeier',
    icon: Users,
    providers: [
      {
        name: 'Maria Hoffmann',
        location: 'Hamburg',
        phone: '+49 40 11223344',
        email: 'maria.hoffmann@trauerrede.de',
        rating: 4.7,
        services: ['Freie Trauerfeiern', 'Kirchliche Zeremonien', 'Gedenkfeiern'],
        available: 'Mo-Sa 9-18 Uhr',
      },
    ],
  },
  {
    id: 3,
    title: 'Floristen',
    description: 'Trauerfloristik und Grabschmuck',
    icon: Heart,
    providers: [
      {
        name: 'Blumen Müller',
        location: 'Frankfurt',
        phone: '+49 69 55667788',
        email: 'info@blumen-mueller.de',
        rating: 4.6,
        services: ['Trauerkränze', 'Grabschmuck', 'Sargschmuck'],
        available: 'Mo-Sa 8-18 Uhr',
      },
    ],
  },
  {
    id: 4,
    title: 'Steinmetze',
    description: 'Grabsteine und Grabmale',
    icon: Award,
    providers: [
      {
        name: 'Steinmetz Bauer',
        location: 'Stuttgart',
        phone: '+49 711 99887766',
        email: 'info@steinmetz-bauer.de',
        rating: 4.8,
        services: ['Grabsteine', 'Grabmale', 'Inschriften'],
        available: 'Mo-Fr 8-17 Uhr',
      },
    ],
  },
]

const Begleiter = () => {
  const { companionValues } = useFilters()
  const filteredServices = filterProviders(services, companionValues)

  return (
    <div className='min-h-screen bg-background relative'>
      {/* Subtle page ornaments */}
      <div className='memorial-page-ornament top-left' />
      <div className='memorial-page-ornament top-right' />
      <div className='memorial-page-ornament bottom-left' />
      <div className='memorial-page-ornament bottom-right' />
      {/* Hero Section */}
      <section className='relative py-16 px-4 bg-gradient-to-b from-primary/5 to-background'>
        <div className='container mx-auto max-w-[978px] text-center'>
          <h1 className='text-4xl md:text-5xl font-memorial font-bold text-foreground mb-4'>Begleiter in schweren Zeiten</h1>
          <p className='text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-elegant'>
            Finden Sie professionelle Unterstützung und einfühlsame Begleitung für alle Aspekte der Trauerfeier und Bestattung. Wir vermitteln vertrauensvolle Partner in Ihrer Nähe.
          </p>
        </div>
      </section>

      {/* Services Overview */}
      <section className='py-12 px-4'>
        <div className='container mx-auto max-w-6xl'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card key={service.id} className='text-center hover:shadow-elegant transition-gentle'>
                  <CardContent className='p-6'>
                    <IconComponent className='w-12 h-12 text-primary mx-auto mb-4' />
                    <h3 className='font-memorial font-semibold text-foreground mb-2'>{service.title}</h3>
                    <p className='text-sm text-muted-foreground font-elegant'>{service.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Detailed Services */}
      <section className='py-12 px-4 bg-muted/30'>
        <div className='container mx-auto max-w-6xl'>
          <h2 className='text-3xl font-memorial font-bold text-foreground text-center mb-4 sm:mb-8 md:mb-16'>Unsere Partner</h2>
          <div className='memorial-section-divider'>
            <span className='memorial-ornament-center'></span>
          </div>

          <div className='my-4 sm:my-8 md:my-16'>
            <Filters />
          </div>

          <CombinedSearchBlocks companion_in_difficult_times_data={filteredServices} />
        </div>
      </section>

      {/* Call to Action */}
      <section className='py-16 px-4'>
        <div className='container mx-auto max-w-4xl text-center'>
          <Heart className='w-16 h-16 text-primary mx-auto mb-6' />
          <h2 className='text-3xl font-memorial font-bold text-foreground mb-4'>Benötigen Sie persönliche Beratung?</h2>
          <p className='text-lg text-muted-foreground mb-8 font-elegant'>Unser Team steht Ihnen in schweren Zeiten zur Seite und vermittelt Sie gerne an die passenden Partner in Ihrer Region.</p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button size='lg' className='shadow-elegant'>
              <Phone className='w-5 h-5 mr-2' />
              Jetzt anrufen: +49 171 2942281
            </Button>
            <Button variant='outline' size='lg'>
              <Mail className='w-5 h-5 mr-2' />
              E-Mail senden
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Begleiter
