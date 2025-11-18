import { Block } from '../types';

export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string; // Emoji oder Icon
  previewImage: string; // URL zu Vorschaubild
  blocks: Block[];
}

export const templates: Template[] = [
  {
    id: 'classic',
    name: 'Klassisch',
    description: 'Eine traditionelle und elegante Gedenkseite',
    preview: '🕯️',
    previewImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    blocks: [
      {
        id: '1',
        type: 'heading',
        level: 1,
        content: '<h1>In liebevoller Erinnerung</h1>',
      },
      {
        id: '2',
        type: 'heading',
        level: 2,
        content: '<h2>Maria Schmidt</h2>',
      },
      {
        id: '3',
        type: 'text',
        content: '<p><strong>Geboren:</strong> 15. März 1945</p><p><strong>Verstorben:</strong> 22. Oktober 2023</p>',
      },
      {
        id: '4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        alt: 'Maria Schmidt',
      },
      {
        id: '5',
        type: 'text',
        content: '<p>Maria war eine liebevolle Mutter, Großmutter und Freundin. Sie verbrachte ihr Leben damit, anderen zu helfen und Freude zu schenken. Ihre warmherzige Persönlichkeit und ihr unerschütterlicher Optimismus werden uns für immer in Erinnerung bleiben.</p>',
      },
      {
        id: '6',
        type: 'heading',
        level: 2,
        content: '<h2>Erinnerungen</h2>',
      },
      {
        id: '7',
        type: 'text',
        content: '<p>Maria liebte es, im Garten zu arbeiten und ihre Enkelkinder zu verwöhnen. Ihre selbstgebackenen Kuchen waren legendär, und ihre Geschichten aus der Kindheit brachten immer ein Lächeln auf unsere Gesichter.</p>',
      },
    ],
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Ein zeitgemäßes und minimalistisches Design',
    preview: '✨',
    previewImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop',
    blocks: [
      {
        id: '1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=600&fit=crop',
        alt: 'Sophie Müller',
      },
      {
        id: '2',
        type: 'heading',
        level: 1,
        content: '<h1>Sophie Müller</h1>',
      },
      {
        id: '3',
        type: 'text',
        content: '<p style="text-align: center; font-size: 1.25rem; color: #666;">1980 - 2023</p>',
      },
      {
        id: '4',
        type: 'heading',
        level: 2,
        content: '<h2>Über Sophie</h2>',
      },
      {
        id: '5',
        type: 'text',
        content: '<p>Sophie war eine leidenschaftliche Lehrerin, die über 20 Jahre lang junge Menschen inspirierte. Sie glaubte fest daran, dass Bildung die Welt verändern kann, und lebte diese Überzeugung jeden Tag in ihrem Klassenzimmer.</p>',
      },
      {
        id: '6',
        type: 'heading',
        level: 2,
        content: '<h2>Lebensweg</h2>',
      },
      {
        id: '7',
        type: 'text',
        content: '<ul><li>Studium der Pädagogik an der Universität München</li><li>Lehrerin an der Grundschule am Park seit 2003</li><li>Auszeichnung als "Lehrerin des Jahres" 2018</li><li>Gründerin der Leseförderungsinitiative "Bücher für alle"</li></ul>',
      },
      {
        id: '8',
        type: 'heading',
        level: 2,
        content: '<h2>In unserem Herzen</h2>',
      },
      {
        id: '9',
        type: 'text',
        content: '<p style="text-align: center; font-style: italic;">"Bildung ist die mächtigste Waffe, mit der man die Welt verändern kann." - Nelson Mandela</p>',
      },
    ],
  },
  {
    id: 'family',
    name: 'Familie',
    description: 'Eine warme und persönliche Gedenkseite für Familien',
    preview: '👨‍👩‍👧‍👦',
    previewImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
    blocks: [
      {
        id: '1',
        type: 'heading',
        level: 1,
        content: '<h1>Zum Gedenken an</h1>',
      },
      {
        id: '2',
        type: 'heading',
        level: 2,
        content: '<h2>Hans Weber</h2>',
      },
      {
        id: '3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop',
        alt: 'Familienfoto',
      },
      {
        id: '4',
        type: 'text',
        content: '<p><strong>Geliebter Ehemann, Vater und Opa</strong></p><p>Geboren: 12. Juni 1950</p><p>Verstorben: 5. September 2023</p>',
      },
      {
        id: '5',
        type: 'heading',
        level: 2,
        content: '<h2>Unsere Erinnerungen</h2>',
      },
      {
        id: '6',
        type: 'text',
        content: '<p>Als Familie erinnern wir uns an die vielen schönen Momente, die wir gemeinsam erlebt haben. Hans war ein liebevoller Ehemann, ein geduldiger Vater und ein fröhlicher Opa, der immer Zeit für seine Familie hatte. Er wird für immer in unseren Herzen bleiben.</p>',
      },
      {
        id: '7',
        type: 'heading',
        level: 2,
        content: '<h2>Besondere Momente</h2>',
      },
      {
        id: '8',
        type: 'text',
        content: '<p>Wir erinnern uns gerne an unsere gemeinsamen Urlaube am Meer, die gemütlichen Sonntagsnachmittage im Garten und die vielen Geburtstagsfeiern, die er mit seiner Gitarre und seinen Liedern unvergesslich gemacht hat.</p>',
      },
      {
        id: '9',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
        alt: 'Erinnerungsfoto',
      },
      {
        id: '10',
        type: 'text',
        content: '<p style="text-align: center;"><strong>Du wirst für immer in unseren Herzen sein</strong></p>',
      },
    ],
  },
  {
    id: 'simple',
    name: 'Einfach',
    description: 'Eine schlichte und respektvolle Gedenkseite',
    preview: '🌹',
    previewImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
    blocks: [
      {
        id: '1',
        type: 'heading',
        level: 1,
        content: '<h1>Anna Fischer</h1>',
      },
      {
        id: '2',
        type: 'text',
        content: '<p style="text-align: center;">1935 - 2023</p>',
      },
      {
        id: '3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop',
        alt: 'Anna Fischer',
      },
      {
        id: '4',
        type: 'text',
        content: '<p style="text-align: center;">In stiller Erinnerung</p>',
      },
      {
        id: '5',
        type: 'text',
        content: '<p>Anna war eine ruhige und bescheidene Person, die ihr Leben in Würde und mit großer innerer Stärke gelebt hat. Sie wird von allen, die sie kannten, sehr vermisst.</p>',
      },
    ],
  },
  {
    id: 'celebration',
    name: 'Lebensfeier',
    description: 'Eine fröhliche Feier des Lebens',
    preview: '🎉',
    previewImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
    blocks: [
      {
        id: '1',
        type: 'heading',
        level: 1,
        content: '<h1>Eine Feier des Lebens</h1>',
      },
      {
        id: '2',
        type: 'heading',
        level: 2,
        content: '<h2>Thomas Klein</h2>',
      },
      {
        id: '3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=600&fit=crop',
        alt: 'Thomas Klein',
      },
      {
        id: '4',
        type: 'text',
        content: '<p>Dies ist eine Feier des wunderbaren Lebens von Thomas. Wir erinnern uns an die Freude, die er in unser Leben gebracht hat, und an all die besonderen Momente, die wir gemeinsam erlebt haben. Sein Lachen war ansteckend, und seine positive Einstellung zum Leben inspirierte jeden, der ihn kannte.</p>',
      },
      {
        id: '5',
        type: 'heading',
        level: 2,
        content: '<h2>Lebensfreude</h2>',
      },
      {
        id: '6',
        type: 'text',
        content: '<p>Thomas liebte es, zu reisen, Musik zu machen und Zeit mit Freunden zu verbringen. Seine Leidenschaft für das Fotografieren war ansteckend, und er hat unzählige wunderschöne Momente für die Ewigkeit festgehalten.</p>',
      },
      {
        id: '7',
        type: 'heading',
        level: 2,
        content: '<h2>Galerie der Erinnerungen</h2>',
      },
      {
        id: '8',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        alt: 'Erinnerungsfoto 1',
      },
      {
        id: '9',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=600&fit=crop',
        alt: 'Erinnerungsfoto 2',
      },
      {
        id: '10',
        type: 'text',
        content: '<p style="text-align: center; font-size: 1.25rem;"><strong>Danke für all die wunderbaren Erinnerungen</strong></p>',
      },
    ],
  },
];

