// "Ways to use Wellspring": one entry per use case, shown on /uses and on
// its own page at /uses/<slug>. Each one points at an event type from
// event-types.ts so the "Check availability" button can fill in the
// rental request form (?type=...).
//
// Static content. Room names, capacities and prices are NOT written here:
// they come from the Events group (room table) and the Content & Community
// group (rates content_item). Copy in [brackets] still needs real details
// from Wellspring.
import { eventTypes } from './event-types';

type EventType = (typeof eventTypes)[number];

export interface UseCase {
  slug: string;
  /** Short name used on cards and in the page title */
  name: string;
  /** Which request-form event type this use case books as */
  eventType: EventType;
  /** One-line hook for cards */
  hook: string;
  /** Page heading and intro */
  title: string;
  intro: string;
  /** The kinds of gatherings this covers */
  ideas: string[];
  /** Why Wellspring works for it */
  reasons: { title: string; body: string }[];
  /** Questions people ask before booking this kind of event */
  questions: string[];
  /** A guest count that shows the "typical" size, used as a search default */
  typicalGuests?: number;
  photoTone: '' | 'tone-coral' | 'tone-gray' | 'tone-teal-dark';
}

export const useCases: UseCase[] = [
  {
    slug: 'weddings',
    name: 'Weddings and showers',
    eventType: 'Weddings',
    hook: 'Receptions, rehearsal dinners and showers in the heart of downtown.',
    title: 'Celebrate your wedding at the well',
    intro:
      'From an intimate ceremony to a full reception, Wellspring gives you a warm, flexible space right on Main Street in Downtown Arlington.',
    ideas: ['Ceremonies', 'Receptions', 'Rehearsal dinners', 'Bridal and baby showers', 'Engagement parties', 'Vow renewals'],
    reasons: [
      { title: 'Make it yours', body: 'Arrange the room the way you picture it, from long banquet tables to a dance floor.' },
      { title: 'Downtown setting', body: 'Main Street storefronts for photos, and downtown restaurants and hotels close by for guests.' },
      { title: 'One place for the weekend', body: 'Book the rehearsal dinner and the reception in the same building.' },
    ],
    questions: ['Can we bring our own caterer and bar service?', 'How early can our vendors set up?', 'Is there a place for the couple to get ready?'],
    typicalGuests: 120,
    photoTone: '',
  },
  {
    slug: 'celebrations',
    name: 'Birthdays and milestones',
    eventType: 'Birthday parties',
    hook: 'Birthdays, quinceañeras, graduations and family reunions.',
    title: 'Room for the moments worth gathering for',
    intro:
      'Birthdays, quinceañeras, graduation parties, anniversaries and reunions all need a place where everyone fits. Bring the family and the cake; we have the room.',
    ideas: ['Birthday parties', 'Quinceañeras', 'Graduation parties', 'Anniversaries', 'Family reunions', 'Celebrations of life'],
    reasons: [
      { title: 'Space for everyone', body: 'Invite the whole family without squeezing into a living room or a back room at a restaurant.' },
      { title: 'Bring your own food', body: 'Cater the way your family celebrates. [Confirm Wellspring’s catering policy.]' },
      { title: 'Easy to find', body: 'A Main Street address guests can find. [Confirm parking details.]' },
    ],
    questions: ['Can we decorate the space?', 'Is there a kitchen or warming area?', 'How long can we rent the room?'],
    typicalGuests: 60,
    photoTone: 'tone-coral',
  },
  {
    slug: 'corporate',
    name: 'Meetings and team events',
    eventType: 'Corporate events',
    hook: 'Offsites, trainings, client events and holiday parties.',
    title: 'Take your team somewhere better than the break room',
    intro:
      'Plan an offsite, a training day, a client reception or the holiday party in a space that feels nothing like the office, right in Downtown Arlington.',
    ideas: ['Team offsites', 'Trainings and workshops', 'Client receptions', 'Holiday parties', 'Product launches', 'Networking mixers'],
    reasons: [
      { title: 'Ready to present', body: 'Professional amenities for presentations and hybrid meetings. [List the actual A/V.]' },
      { title: 'Set up your way', body: 'Classroom rows, small breakout tables or an open reception.' },
      { title: 'Spend locally', body: 'Your event supports a community gathering place in the city where your team works.' },
    ],
    questions: ['What A/V and Wi-Fi are included?', 'Can we book a half day?', 'Do you invoice businesses?'],
    typicalGuests: 40,
    photoTone: 'tone-gray',
  },
  {
    slug: 'nonprofits',
    name: 'Nonprofit gatherings',
    eventType: 'Nonprofit events',
    hook: 'Board retreats, fundraisers and volunteer trainings.',
    title: 'A home base for organizations doing good',
    intro:
      'Wellspring exists to bring the community together, and nonprofits are a big part of that. Host your board retreat, fundraiser, volunteer training or annual meeting here.',
    ideas: ['Board retreats', 'Fundraisers and galas', 'Volunteer trainings', 'Annual meetings', 'Donor events', 'Coalition meetings'],
    reasons: [
      { title: 'Mission-minded', body: 'Wellspring is run by a nonprofit, the Arlington Center for Community Engagement.' },
      { title: 'Room to grow', body: 'Start with a small meeting and come back for your gala.' },
      { title: 'Ask about rates', body: '[Confirm whether Wellspring offers a nonprofit rate, and show it here.]' },
    ],
    questions: ['Do you offer a nonprofit rate?', 'Can we hold a regular monthly meeting here?', 'Can we sell tickets to our event?'],
    typicalGuests: 30,
    photoTone: 'tone-teal-dark',
  },
  {
    slug: 'community',
    name: 'Community meetings',
    eventType: 'Community events',
    hook: 'Neighborhood meetings, forums and town halls.',
    title: 'Where Arlington comes together to talk',
    intro:
      'Like the village well, Wellspring is a place where neighbors share news and look after one another. Bring your neighborhood association, forum or town hall here.',
    ideas: ['Neighborhood association meetings', 'Community forums', 'Town halls', 'Support groups', 'Faith and study groups', 'Civic workshops'],
    reasons: [
      { title: 'Neutral ground', body: 'A welcoming downtown space that belongs to no single group.' },
      { title: 'Accessible', body: '[Confirm accessibility details: entrances, restrooms, seating.]' },
      { title: 'Part of something bigger', body: 'Join a calendar of community programs already happening here.' },
    ],
    questions: ['Is the building accessible?', 'Can we book the same time every month?', 'Can our event be listed on your public calendar?'],
    typicalGuests: 50,
    photoTone: 'tone-coral',
  },
  {
    slug: 'classes',
    name: 'Classes and workshops',
    eventType: 'Other gatherings',
    hook: 'Teach a class, run a workshop or host a weekly session.',
    title: 'Teach what you love, right on Main Street',
    intro:
      'Fitness instructors, artists, tutors and coaches need a reliable room. Rent Wellspring once for a workshop, or book a regular slot for a weekly class.',
    ideas: ['Art and craft workshops', 'Fitness and dance classes', 'Tutoring and test prep', 'Cooking demos', 'Language classes', 'Wellness sessions'],
    reasons: [
      { title: 'Book it every week', body: 'Hold the same day and time for a recurring class. [Confirm recurring booking options.]' },
      { title: 'Easy for students to find', body: 'A visible downtown address on Main Street.' },
      { title: 'Fits the mission', body: 'Wellspring supports the physical, emotional and spiritual health of our neighbors. Your class does too.' },
    ],
    questions: ['Can I book a regular weekly time?', 'Is there storage for my supplies?', 'Can I charge for my class?'],
    typicalGuests: 20,
    photoTone: '',
  },
  {
    slug: 'markets',
    name: 'Markets, pop-ups and shows',
    eventType: 'Other gatherings',
    hook: 'Pop-up shops, maker markets, exhibits and performances.',
    title: 'Bring your pop-up to downtown',
    intro:
      'Try out a storefront for a day. Host a maker market, art show, book signing, small performance or photo shoot where downtown foot traffic already is.',
    ideas: ['Maker and holiday markets', 'Pop-up shops', 'Art exhibits', 'Book signings and readings', 'Small performances', 'Photo and video shoots'],
    reasons: [
      { title: 'Foot traffic', body: 'Main Street visitors, plus everyone coming to Wellspring programs.' },
      { title: 'A blank canvas', body: 'An open room you can fill with tables, easels or a stage.' },
      { title: 'Short rentals', body: '[Confirm the shortest rental and load-in times.]' },
    ],
    questions: ['How do vendors load in?', 'Can we promote our event as open to the public?', 'Can we hang art on the walls?'],
    typicalGuests: 80,
    photoTone: 'tone-gray',
  },
];

/** Link to the rental request form with this use case's type filled in. */
export function requestHref(u: UseCase): string {
  const params = new URLSearchParams({ type: u.eventType });
  if (u.typicalGuests) params.set('guests', String(u.typicalGuests));
  return `/event-rentals?${params}#request`;
}

/** Where an event-type chip should link: its use-case page, or the overview
 *  when more than one use case books as that type ("Other gatherings"). */
export function useCaseHref(eventType: string): string {
  const matches = useCases.filter((u) => u.eventType === eventType);
  return matches.length === 1 ? `/uses/${matches[0].slug}` : '/uses';
}
