import { useEffect, useState } from 'react'

import { supabase } from '@/integrations/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { BookMarked, Info, LogIn, LogOut, Menu, Newspaper, Settings, User, Users, House, NotepadTextDashed } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: adminData } = await supabase.from('dde_admin_users').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle()

        setIsAdmin(!!adminData)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        // Use setTimeout to defer the Supabase call and prevent deadlock
        setTimeout(async () => {
          const { data: adminData } = await supabase.from('dde_admin_users').select('*').eq('user_id', session.user.id).eq('is_active', true).maybeSingle()

          setIsAdmin(!!adminData)
        }, 0)
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
  // const navItems = [
  //   {
  //     path: '/gedenkportal',
  //     label: 'Gedenkportal',
  //     icon: BookMarked,
  //   },
  //   {
  //     path: '/traueranzeigen',
  //     label: 'Inserate',
  //     icon: Newspaper,
  //   },
  //   {
  //     path: '/begleiter',
  //     label: 'Branche',
  //     icon: Users,
  //   },
  //   {
  //     path: '/',
  //     label: 'Begleiter/Tiere',
  //     icon: Users,
  //   },
  //   {
  //     path: '/ueber-uns',
  //     label: 'Über uns',
  //     icon: Info,
  //   },
  // ]
  const navItems = [
    {
      path: '/',
      label: 'Startseite',
      icon: House,
    },
    {
      path: '/gedenkportal',
      label: 'Bürgerradar',
      icon: BookMarked,
    },
    {
      path: '/gedenkseite/erstellen',
      label: 'Gedenkseiten-Editor',
      icon: NotepadTextDashed,
    },
    {
      path: '/ueber-uns',
      label: 'Über uns',
      icon: Info,
    },
    {
      path: '/kontakt',     
      label: 'Kontakt',
      icon: Newspaper
    }
  ]

  const isActive = (path: string) => location.pathname === path
  const NavLinks = ({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) => (
    <>
      {navItems.map((item) => {
        const IconComponent = item.icon
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={`
              ${mobile ? 'flex items-center space-x-3 p-3 rounded-lg' : 'px-4 py-2 rounded-md'}
              text-sm font-elegant transition-gentle
              ${isActive(item.path) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
            `}
          >
            <IconComponent className='w-4 h-4 mx-auto mb-1' />
            {item.label}
          </Link>
        )
      })}
    </>
  )
  return (
    <nav className='sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border relative'>
      {/* Decorative ornaments */}
      <div className='absolute top-2 left-4 memorial-ornament-small' />
      <div className='absolute top-2 right-4 memorial-ornament-small' />
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center h-24'>
          {/* Logo */}
          <Link to='/' className='flex items-center space-x-3 font-memorial text-lg font-semibold text-foreground pt-1'>
            <img src='/lovable-uploads/9d4e5b81-dc9c-475a-aa0b-bcfb30b624d0.png' alt='Das Deutschland Echo Logo' className='h-32 w-auto' />
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-2'>
            <NavLinks />
          </div>

          {/* CTA Button - Desktop */}
          <div className='hidden md:flex items-center space-x-2'>
            {user ? (
              <>
                <Button asChild variant='outline' size='sm'>
                  <Link to='/user-bereich'>
                    <User className='w-4 h-4 mr-2' />
                    Mein Bereich
                  </Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant='secondary' size='sm'>
                    <Link to='/admin-bereich'>
                      <Settings className='w-4 h-4 mr-2' />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button onClick={() => supabase.auth.signOut()} variant='ghost' size='sm'>
                  <LogOut className='w-4 h-4 mr-2' />
                  Abmelden
                </Button>
              </>
            ) : (
              <Button asChild variant='outline' size='sm'>
                <Link to='/auth'>
                  <LogIn className='w-4 h-4 mr-2' />
                  Anmelden
                </Link>
              </Button>
            )}
            <Button asChild size='sm' className='shadow-elegant'>
              <Link to='/gedenkportal'>
                <Newspaper className='w-4 h-4 mr-2' />
                Gedenkseite erstellen
              </Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className='md:hidden'>
              <Button variant='ghost' size='icon'>
                <Menu className='h-5 w-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-[280px] sm:w-[350px]'>
              <div className='flex flex-col h-full'>
                <div className='flex items-center space-x-3 mb-8'>
                  <img src='/lovable-uploads/9d4e5b81-dc9c-475a-aa0b-bcfb30b624d0.png' alt='Das Deutschland Echo Logo' className='h-8 w-auto' />
                  <span className='font-memorial text-xl font-semibold'>Das Deutschland Echo</span>
                </div>

                <div className='flex-1 space-y-2'>
                  <NavLinks mobile onItemClick={() => setIsOpen(false)} />
                </div>

                <div className='pt-6 border-t space-y-2'>
                  {user ? (
                    <>
                      <Button asChild variant='outline' className='w-full'>
                        <Link to='/user-bereich' onClick={() => setIsOpen(false)}>
                          <User className='w-4 h-4 mr-2' />
                          Mein Bereich
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button asChild variant='secondary' className='w-full'>
                          <Link to='/admin-bereich' onClick={() => setIsOpen(false)}>
                            <Settings className='w-4 h-4 mr-2' />
                            Admin
                          </Link>
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          supabase.auth.signOut()
                          setIsOpen(false)
                        }}
                        variant='ghost'
                        className='w-full'
                      >
                        <LogOut className='w-4 h-4 mr-2' />
                        Abmelden
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant='outline' className='w-full'>
                      <Link to='/auth' onClick={() => setIsOpen(false)}>
                        <LogIn className='w-4 h-4 mr-2' />
                        Anmelden
                      </Link>
                    </Button>
                  )}
                  <Button asChild className='w-full'>
                    <Link to='/gedenkportal' onClick={() => setIsOpen(false)}>
                      <Newspaper className='w-4 h-4 mr-2' />
                      Gedenkseite erstellen
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
export default Navigation
