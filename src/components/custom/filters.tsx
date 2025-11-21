import { CountryOptionsType, GenderOptionsType, ReasonOfDeathOptionsType, country_options, states_options, useFilters } from '@/context/filters'
import { BookMarked, Newspaper, RotateCcw, Search, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

export type Filters = 'memorial_portal' | 'obituaries' | 'companion_in_difficult_times' | 'companions_animals'

export const menuItems = [
  {
    name: 'Gedenkportal',
    value: 'memorial_portal',
    icon: BookMarked,
    dropdown: {
      title: 'Kategorie',
      options: [
        {
          name: 'Sternenkinder',
          value: 'Sternenkinder',
        },
        {
          name: 'Prominente',
          value: 'Prominente',
        },
        {
          name: 'Mordopfer',
          value: 'Mordopfer',
        },
        {
          name: 'Holocaustopfer',
          value: 'Holocaustopfer',
        },
        {
          name: 'Kriegsopfer',
          value: 'Kriegsopfer',
        },
        {
          name: 'Normal/Standard',
          value: 'Normal/Standard',
        },
      ],
    },
  },
  {
    name: 'Inserate',
    value: 'obituaries',
    icon: Newspaper,
    dropdown: {
      title: 'Art der Anzeige',
      options: [
        {
          name: 'In Gedenken',
          value: 'In Gedenken',
        },
        {
          name: 'Danksagungen',
          value: 'Danksagungen',
        },
        {
          name: 'Nachruf',
          value: 'Nachruf',
        },
        {
          name: 'Normal/Standard',
          value: 'Normal/Standard',
        },
      ],
    },
  },
  {
    name: 'Branche',
    value: 'companion_in_difficult_times',
    icon: Users,
    dropdown: {
      title: 'Branche',
      options: [
        {
          name: 'Steinmetze',
          value: 'Steinmetze',
        },
        {
          name: 'Floristen',
          value: 'Floristen',
        },
        {
          name: 'Funeral Homes',
          value: 'Funeral Homes',
        },
        {
          name: 'Normal/Standard',
          value: 'Normal/Standard',
        },
      ],
    },
  },
  {
    name: 'Begleiter/Tiere',
    value: 'companions_animals',
    icon: Users,
    dropdown: {
      title: 'Art der Begleitung',
      options: [
        {
          name: 'Hund',
          value: 'Hund',
        },
        {
          name: 'Katze',
          value: 'Katze',
        },
        {
          name: 'Pferd',
          value: 'Pferd',
        },
        {
          name: 'Normal/Standard',
          value: 'Normal/Standard',
        },
      ],
    },
  },
] as {
  name: string
  value: Filters
  icon: any
  url: string
  dropdown: {
    title: string
    options: {
      name: string
      value: string
    }[]
  }
}[]

export default function Filters() {
  const { memorialValues, setMemorialValues, obituariesValues, setObituariesValues, companionValues, setCompanionValues, animalValues, setAnimalValues, selectedFilter, setSelectedFilter, resetFilters } = useFilters()

  const getGetterByValue = {
    memorial_portal: memorialValues,
    obituaries: obituariesValues,
    companion_in_difficult_times: companionValues,
    companions_animals: animalValues,
  }

  const getSetterByValue = {
    memorial_portal: setMemorialValues,
    obituaries: setObituariesValues,
    companion_in_difficult_times: setCompanionValues,
    companions_animals: setAnimalValues,
  }

  const currentMemorialMenuItem = menuItems.find((item) => item.value === 'memorial_portal')
  const currentObituariesMenuItem = menuItems.find((item) => item.value === 'obituaries')
  const currentCompanionMenuItem = menuItems.find((item) => item.value === 'companion_in_difficult_times')
  const currentAnimalMenuItem = menuItems.find((item) => item.value === 'companions_animals')

  const beautifyCountryName = {
    german: 'Deutschland',
    austria: 'Österreich',
    switzerland: 'Schweiz',
  }

  return (
    <div className='w-full max-w-[1300px] h-full mx-auto grid sm:grid-cols-[150px_1fr] bg-white sm:rounded-xl border border-[1px] poppins'>
      <div className='w-full sm:w-[150px] h-full min-h-fit grid sm:grid-rows-4 bg-muted sm:rounded-l-xl sm:border-r'>
        {menuItems?.map((menuItem, menuItemIndex) => {
          const IconComponent = menuItem?.icon

          const isSelected = menuItem?.value === selectedFilter
          const isFirstInList = menuItemIndex === 0
          const isLastInList = menuItemIndex === menuItems.length - 1

          return (
            <div
              key={menuItem?.name + menuItem?.value + 76845}
              onClick={() => {
                setSelectedFilter(menuItem?.value)
              }}
              className={`w-full h-full gap-1 flex flex-col items-center justify-center px-4 py-2 hover:bg-white transition duration-[200ms] cursor-pointer border-b sm:border-unset
                  ${isFirstInList ? 'sm:rounded-tl-xl' : isLastInList ? 'sm:rounded-bl-xl' : ''}
                  ${!isFirstInList && !isLastInList ? 'sm:border-b' : ''}
                  ${isFirstInList ? 'sm:border-b' : ''}
                  ${isSelected ? 'bg-white sm:relative md:left-[1px]' : ''}
                  `}
            >
              <IconComponent className='w-4 h-4 stroke-[#1b1b21]' />
              <p className='text-sm text-[#1b1b21]'>{menuItem?.name}</p>
            </div>
          )
        })}
      </div>
      <div className='w-full h-full flex flex-col justify-between gap-0'>
        {/* memorial_portal */}
        {selectedFilter === 'memorial_portal' && memorialValues?.dropdown ? (
          <div className='w-full h-fit grid grid-cols-1 md:grid-cols-3 gap-4 py-4 px-6'>
            {/* 0. Dropdown */}
            {/* 1. Vorname (first name) */}
            {/* 2. Nachname (last name) */}
            {/* 3. Land (country) [Deutschland, Österreich, Schweiz] */}
            {/* 4. Bundesländer (federal states) [CHECK THE LIST] */}
            {/* 5. PLZ Umkreis (Postal code area) */}
            {/* 6. Ort Umkreis bis Km (Location radius in Km) */}
            {/* 7. Geschlecht (gender) [männlich, weiblich] */}
            {/* 8. Todesursache (reason of death) ["Natürlicher Tod", "Unfall", "Suizid", "Tötungsdelikt", "Ungeklärt"] */}

            {/* 0. Dropdown */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>{currentMemorialMenuItem?.dropdown?.title}</p>
              <Select
                value={getGetterByValue[currentMemorialMenuItem?.value]?.dropdown}
                onValueChange={(newVal) => {
                  getSetterByValue[currentMemorialMenuItem?.value]((prev) => ({ ...prev, dropdown: newVal }))
                }}
              >
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder={currentMemorialMenuItem?.dropdown?.title} />
                </SelectTrigger>
                <SelectContent>
                  {currentMemorialMenuItem?.dropdown?.options?.map((dropdownOption) => {
                    return (
                      <SelectItem className='poppins' key={dropdownOption?.name + dropdownOption?.value + 38445} value={dropdownOption?.value}>
                        {dropdownOption?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 1. Vorname (first name) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Vorname</p>
              <Input className='bg-[#e6eaf0]' placeholder='Name' value={memorialValues?.firstName} onChange={(event) => setMemorialValues((prev) => ({ ...prev, firstName: event.target.value }))} />
            </div>

            {/* 2. Nachname (last name) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Nachname</p>
              <Input className='bg-[#e6eaf0]' placeholder='Name' value={memorialValues?.lastName} onChange={(event) => setMemorialValues((prev) => ({ ...prev, lastName: event.target.value }))} />
            </div>

            {/* 3. Land (country) [Deutschland, Österreich, Schweiz] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Land</p>
              <Select value={memorialValues?.country} onValueChange={(newValue: CountryOptionsType) => setMemorialValues((prev) => ({ ...prev, country: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Land' />
                </SelectTrigger>
                <SelectContent>
                  {country_options?.map((countryOption) => {
                    if (countryOption === '') {
                      return
                    }

                    return (
                      <SelectItem className='poppins' key={countryOption + 65481} value={countryOption}>
                        {beautifyCountryName[countryOption]}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Bundesländer (federal states) [CHECK THE LIST] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Bundesländer</p>
              <Select value={memorialValues?.state} onValueChange={(newValue: any) => setMemorialValues((prev) => ({ ...prev, state: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Bundesländer' />
                </SelectTrigger>
                <SelectContent>
                  {states_options?.[memorialValues?.country]?.map((stateOption) => {
                    return (
                      <SelectItem className='poppins' key={stateOption + 65472} value={stateOption}>
                        {stateOption}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 5. PLZ Umkreis (Postal code area) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>PLZ Umkreis</p>
              <Input className='bg-[#e6eaf0]' placeholder='PLZ Umkreis' value={memorialValues?.zip} onChange={(event) => setMemorialValues((prev) => ({ ...prev, zip: event.target.value }))} />
            </div>

            {/* 6. Ort Umkreis bis Km (Location radius in Km) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Ort Umkreis ({memorialValues.zipRadius}) Km</p>
              <Slider className='my-auto' defaultValue={[memorialValues.zipRadius]} value={[memorialValues.zipRadius]} onValueChange={(newValue) => setMemorialValues((prev) => ({ ...prev, zipRadius: newValue[0] }))} min={1} max={1000} />
            </div>

            {/* 7. Geschlecht (gender) [männlich, weiblich] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Geschlecht</p>
              <Select value={memorialValues?.gender} onValueChange={(newValue: GenderOptionsType) => setMemorialValues((prev) => ({ ...prev, gender: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Geschlecht' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className='poppins' value='male'>
                    männlich
                  </SelectItem>
                  <SelectItem className='poppins' value='female'>
                    weiblich
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 8. Todesursache (reason of death) ["Natürlicher Tod", "Unfall", "Suizid", "Tötungsdelikt", "Ungeklärt"] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Todesursache</p>
              <Select value={memorialValues?.reasonOfDeath} onValueChange={(newValue: ReasonOfDeathOptionsType) => setMemorialValues((prev) => ({ ...prev, reasonOfDeath: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Todesursache' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className='poppins' value='naturalDeath'>
                    Natürlicher Tod
                  </SelectItem>
                  <SelectItem className='poppins' value='accident'>
                    Unfall
                  </SelectItem>
                  <SelectItem className='poppins' value='suicide'>
                    Suizid
                  </SelectItem>
                  <SelectItem className='poppins' value='homicide'>
                    Tötungsdelikt
                  </SelectItem>
                  <SelectItem className='poppins' value='unclear'>
                    Ungeklärt
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='hidden md:flex'></div>
            <div className='hidden md:flex'></div>
            <Button className='mt-auto'>
              <Search /> Ergebnisse anzeigen
            </Button>
          </div>
        ) : (
          selectedFilter === 'memorial_portal' && (
            <div className='py-4 px-6 flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>{currentMemorialMenuItem?.dropdown?.title}</p>
              <Select
                value={getGetterByValue[currentMemorialMenuItem?.value]?.dropdown}
                onValueChange={(newVal) => {
                  getSetterByValue[currentMemorialMenuItem?.value]((prev) => ({ ...prev, dropdown: newVal }))
                }}
              >
                <SelectTrigger className='w-full sm:w-[200px] h-fit gap-1 outline-none cursor-pointer bg-[#e6eaf0]'>
                  <SelectValue placeholder={currentMemorialMenuItem?.dropdown?.title} />
                </SelectTrigger>
                <SelectContent>
                  {currentMemorialMenuItem?.dropdown?.options?.map((dropdownOption) => {
                    return (
                      <SelectItem className='poppins' key={dropdownOption?.name + dropdownOption?.value + 38445} value={dropdownOption?.value}>
                        {dropdownOption?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )
        )}
        {/* memorial_portal - END */}
        {/* obituaries */}
        {selectedFilter === 'obituaries' && obituariesValues?.dropdown ? (
          <div className='w-full h-fit grid grid-cols-1 md:grid-cols-3 gap-4 py-4 px-6'>
            {/* 0. Dropdown */}
            {/* 1. Vorname (first name) */}
            {/* 2. Nachname (last name) */}
            {/* 3. Land (country) [Deutschland, Österreich, Schweiz] */}
            {/* 4. Bundesländer (federal states) [CHECK THE LIST] */}
            {/* 5. PLZ Umkreis (Postal code area) */}
            {/* 6. Ort Umkreis bis Km (Location radius in Km) */}
            {/* 7. Geschlecht (gender) [männlich, weiblich] */}
            {/* 8. Todesursache (reason of death) ["Natürlicher Tod", "Unfall", "Suizid", "Tötungsdelikt", "Ungeklärt"] */}

            {/* 0. Dropdown */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>{currentObituariesMenuItem?.dropdown?.title}</p>
              <Select
                value={getGetterByValue[currentObituariesMenuItem?.value]?.dropdown}
                onValueChange={(newVal) => {
                  getSetterByValue[currentObituariesMenuItem?.value]((prev) => ({ ...prev, dropdown: newVal }))
                }}
              >
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder={currentObituariesMenuItem?.dropdown?.title} />
                </SelectTrigger>
                <SelectContent>
                  {currentObituariesMenuItem?.dropdown?.options?.map((dropdownOption) => {
                    return (
                      <SelectItem className='poppins' key={dropdownOption?.name + dropdownOption?.value + 38445} value={dropdownOption?.value}>
                        {dropdownOption?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 1. Vorname (first name) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Vorname</p>
              <Input className='bg-[#e6eaf0]' placeholder='Name' value={obituariesValues?.firstName} onChange={(event) => setObituariesValues((prev) => ({ ...prev, firstName: event.target.value }))} />
            </div>

            {/* 2. Nachname (last name) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Nachname</p>
              <Input className='bg-[#e6eaf0]' placeholder='Name' value={obituariesValues?.lastName} onChange={(event) => setObituariesValues((prev) => ({ ...prev, lastName: event.target.value }))} />
            </div>

            {/* 3. Land (country) [Deutschland, Österreich, Schweiz] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Land</p>
              <Select value={obituariesValues?.country} onValueChange={(newValue: CountryOptionsType) => setObituariesValues((prev) => ({ ...prev, country: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Land' />
                </SelectTrigger>
                <SelectContent>
                  {country_options?.map((countryOption) => {
                    if (countryOption === '') {
                      return
                    }

                    return (
                      <SelectItem className='poppins' key={countryOption + 55564} value={countryOption}>
                        {beautifyCountryName[countryOption]}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Bundesländer (federal states) [CHECK THE LIST] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Bundesländer</p>
              <Select value={obituariesValues?.state} onValueChange={(newValue: any) => setObituariesValues((prev) => ({ ...prev, state: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Bundesländer' />
                </SelectTrigger>
                <SelectContent>
                  {states_options?.[obituariesValues?.country]?.map((stateOption) => {
                    return (
                      <SelectItem className='poppins' key={stateOption + 65472} value={stateOption}>
                        {stateOption}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 5. PLZ Umkreis (Postal code area) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>PLZ Umkreis</p>
              <Input className='bg-[#e6eaf0]' placeholder='PLZ Umkreis' value={obituariesValues?.zip} onChange={(event) => setObituariesValues((prev) => ({ ...prev, zip: event.target.value }))} />
            </div>

            {/* 6. Ort Umkreis bis Km (Location radius in Km) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Ort Umkreis ({obituariesValues.zipRadius}) Km</p>
              <Slider className='my-auto' defaultValue={[obituariesValues.zipRadius]} value={[obituariesValues.zipRadius]} onValueChange={(newValue) => setObituariesValues((prev) => ({ ...prev, zipRadius: newValue[0] }))} min={1} max={1000} />
            </div>

            {/* 7. Geschlecht (gender) [männlich, weiblich] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Geschlecht</p>
              <Select value={obituariesValues?.gender} onValueChange={(newValue: GenderOptionsType) => setObituariesValues((prev) => ({ ...prev, gender: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Geschlecht' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className='poppins' value='male'>
                    männlich
                  </SelectItem>
                  <SelectItem className='poppins' value='female'>
                    weiblich
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 8. Todesursache (reason of death) ["Natürlicher Tod", "Unfall", "Suizid", "Tötungsdelikt", "Ungeklärt"] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Todesursache</p>
              <Select value={obituariesValues?.reasonOfDeath} onValueChange={(newValue: ReasonOfDeathOptionsType) => setObituariesValues((prev) => ({ ...prev, reasonOfDeath: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Todesursache' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className='poppins' value='naturalDeath'>
                    Natürlicher Tod
                  </SelectItem>
                  <SelectItem className='poppins' value='accident'>
                    Unfall
                  </SelectItem>
                  <SelectItem className='poppins' value='suicide'>
                    Suizid
                  </SelectItem>
                  <SelectItem className='poppins' value='homicide'>
                    Tötungsdelikt
                  </SelectItem>
                  <SelectItem className='poppins' value='unclear'>
                    Ungeklärt
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='hidden md:flex'></div>
            <div className='hidden md:flex'></div>
            <Button className='mt-auto'>
              <Search /> Ergebnisse anzeigen
            </Button>
          </div>
        ) : (
          selectedFilter === 'obituaries' && (
            <div className='py-4 px-6 flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>{currentObituariesMenuItem?.dropdown?.title}</p>
              <Select
                value={getGetterByValue[currentObituariesMenuItem?.value]?.dropdown}
                onValueChange={(newVal) => {
                  getSetterByValue[currentObituariesMenuItem?.value]((prev) => ({ ...prev, dropdown: newVal }))
                }}
              >
                <SelectTrigger className='w-full sm:w-[200px] h-fit gap-1 outline-none cursor-pointer bg-[#e6eaf0]'>
                  <SelectValue placeholder={currentObituariesMenuItem?.dropdown?.title} />
                </SelectTrigger>
                <SelectContent>
                  {currentObituariesMenuItem?.dropdown?.options?.map((dropdownOption) => {
                    return (
                      <SelectItem className='poppins' key={dropdownOption?.name + dropdownOption?.value + 38445} value={dropdownOption?.value}>
                        {dropdownOption?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )
        )}
        {/* obituaries - END */}
        {/* companion_in_difficult_times */}
        {selectedFilter === 'companion_in_difficult_times' && companionValues?.dropdown ? (
          <div className='w-full h-fit grid grid-cols-1 md:grid-cols-3 gap-4 py-4 px-6'>
            {/* 0. Dropdown */}
            {/* 1. Vorname (first name) */}
            {/* 2. Nachname (last name) */}
            {/* 3. Land (country) [Deutschland, Österreich, Schweiz] */}
            {/* 4. Bundesländer (federal states) [CHECK THE LIST] */}
            {/* 5. PLZ Umkreis (Postal code area) */}
            {/* 6. Ort Umkreis bis Km (Location radius in Km) */}

            {/* 0. Dropdown */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>{currentCompanionMenuItem?.dropdown?.title}</p>
              <Select
                value={getGetterByValue[currentCompanionMenuItem?.value]?.dropdown}
                onValueChange={(newVal) => {
                  getSetterByValue[currentCompanionMenuItem?.value]((prev) => ({ ...prev, dropdown: newVal }))
                }}
              >
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder={currentCompanionMenuItem?.dropdown?.title} />
                </SelectTrigger>
                <SelectContent>
                  {currentCompanionMenuItem?.dropdown?.options?.map((dropdownOption) => {
                    return (
                      <SelectItem className='poppins' key={dropdownOption?.name + dropdownOption?.value + 38445} value={dropdownOption?.value}>
                        {dropdownOption?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 1. Vorname (first name) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Vorname</p>
              <Input className='bg-[#e6eaf0]' placeholder='Name' value={companionValues?.firstName} onChange={(event) => setCompanionValues((prev) => ({ ...prev, firstName: event.target.value }))} />
            </div>

            {/* 2. Nachname (last name) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Nachname</p>
              <Input className='bg-[#e6eaf0]' placeholder='Name' value={companionValues?.lastName} onChange={(event) => setCompanionValues((prev) => ({ ...prev, lastName: event.target.value }))} />
            </div>

            {/* 3. Land (country) [Deutschland, Österreich, Schweiz] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Land</p>
              <Select value={companionValues?.country} onValueChange={(newValue: CountryOptionsType) => setCompanionValues((prev) => ({ ...prev, country: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Land' />
                </SelectTrigger>
                <SelectContent>
                  {country_options?.map((countryOption) => {
                    if (countryOption === '') {
                      return
                    }

                    return (
                      <SelectItem className='poppins' key={countryOption + 12841} value={countryOption}>
                        {beautifyCountryName[countryOption]}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Bundesländer (federal states) [CHECK THE LIST] */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Bundesländer</p>
              <Select value={companionValues?.state} onValueChange={(newValue: any) => setCompanionValues((prev) => ({ ...prev, state: newValue }))}>
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder='Bundesländer' />
                </SelectTrigger>
                <SelectContent>
                  {states_options?.[companionValues?.country]?.map((stateOption) => {
                    return (
                      <SelectItem className='poppins' key={stateOption + 65472} value={stateOption}>
                        {stateOption}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 5. PLZ Umkreis (Postal code area) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>PLZ Umkreis</p>
              <Input className='bg-[#e6eaf0]' placeholder='PLZ Umkreis' value={companionValues?.zip} onChange={(event) => setCompanionValues((prev) => ({ ...prev, zip: event.target.value }))} />
            </div>

            {/* 6. Ort Umkreis bis Km (Location radius in Km) */}
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>Ort Umkreis ({companionValues.zipRadius}) Km</p>
              <Slider className='my-auto' defaultValue={[companionValues.zipRadius]} value={[companionValues.zipRadius]} onValueChange={(newValue) => setCompanionValues((prev) => ({ ...prev, zipRadius: newValue[0] }))} min={1} max={1000} />
            </div>

            <div className='hidden md:flex'></div>
            <Button className='mt-auto'>
              <Search /> Ergebnisse anzeigen
            </Button>
          </div>
        ) : (
          selectedFilter === 'companion_in_difficult_times' && (
            <div className='py-4 px-6 flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>{currentCompanionMenuItem?.dropdown?.title}</p>
              <Select
                value={getGetterByValue[currentCompanionMenuItem?.value]?.dropdown}
                onValueChange={(newVal) => {
                  getSetterByValue[currentCompanionMenuItem?.value]((prev) => ({ ...prev, dropdown: newVal }))
                }}
              >
                <SelectTrigger className='w-full sm:w-[200px] h-fit gap-1 outline-none cursor-pointer bg-[#e6eaf0]'>
                  <SelectValue placeholder={currentCompanionMenuItem?.dropdown?.title} />
                </SelectTrigger>
                <SelectContent>
                  {currentCompanionMenuItem?.dropdown?.options?.map((dropdownOption) => {
                    return (
                      <SelectItem className='poppins' key={dropdownOption?.name + dropdownOption?.value + 38445} value={dropdownOption?.value}>
                        {dropdownOption?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )
        )}
        {/* companion_in_difficult_times - END */}

        {selectedFilter === 'companions_animals' && animalValues?.dropdown ? (
          <div className='w-full h-fit grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4 px-6'>
            <div className='flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>{currentAnimalMenuItem?.dropdown?.title}</p>
              <Select
                value={getGetterByValue[currentAnimalMenuItem?.value]?.dropdown}
                onValueChange={(newVal) => {
                  getSetterByValue[currentAnimalMenuItem?.value]((prev) => ({ ...prev, dropdown: newVal }))
                }}
              >
                <SelectTrigger className='w-full bg-[#e6eaf0]'>
                  <SelectValue placeholder={currentAnimalMenuItem?.dropdown?.title} />
                </SelectTrigger>
                <SelectContent>
                  {currentAnimalMenuItem?.dropdown?.options?.map((dropdownOption) => {
                    return (
                      <SelectItem className='poppins' key={dropdownOption?.name + dropdownOption?.value + 38445} value={dropdownOption?.value}>
                        {dropdownOption?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          selectedFilter === 'companions_animals' && (
            <div className='py-4 px-6 flex flex-col gap-[4px]'>
              <p className='text-sm font-[600]'>{currentAnimalMenuItem?.dropdown?.title}</p>
              <Select
                value={getGetterByValue[currentAnimalMenuItem?.value]?.dropdown}
                onValueChange={(newVal) => {
                  getSetterByValue[currentAnimalMenuItem?.value]((prev) => ({ ...prev, dropdown: newVal }))
                }}
              >
                <SelectTrigger className='w-full sm:w-[200px] h-fit gap-1 outline-none cursor-pointer bg-[#e6eaf0]'>
                  <SelectValue placeholder={currentAnimalMenuItem?.dropdown?.title} />
                </SelectTrigger>
                <SelectContent>
                  {currentAnimalMenuItem?.dropdown?.options?.map((dropdownOption) => {
                    return (
                      <SelectItem className='poppins' key={dropdownOption?.name + dropdownOption?.value + 38445} value={dropdownOption?.value}>
                        {dropdownOption?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )
        )}

        <div className='w-fit ml-auto mt-auto mx-8 my-4 flex items-center gap-2 cursor-pointer' onClick={resetFilters}>
          <RotateCcw className='w-4' />
          <p className='text-sm font-[600] mt-[2px]'>Zurücksetzen</p>
        </div>
      </div>
    </div>
  )
}
