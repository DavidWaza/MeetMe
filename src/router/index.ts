import { createRouter, createWebHistory } from 'vue-router'
import { restoreAuSession } from '@/features/auth/session/composition/use-au-auth'
import { useSessionStore } from '@/stores/session'
import DiscoverView from '../views/DiscoverView.vue'
import { ROUTE_NAMES } from './route-names'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    /** Full-screen routes (a conversation) hide the bottom navigation. */
    hideTabBar?: boolean
    /** Reachable signed out (log in, sign up). Everything else needs a session. */
    public?: boolean
  }
}

const APP_NAME = 'MeetMe'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: ROUTE_NAMES.discover } },
    {
      path: '/login',
      name: ROUTE_NAMES.login,
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Log in', public: true, hideTabBar: true },
    },
    {
      path: '/signup',
      name: ROUTE_NAMES.signup,
      component: () => import('../views/SignupView.vue'),
      meta: { title: 'Sign up', public: true, hideTabBar: true },
    },
    {
      path: '/discover',
      name: ROUTE_NAMES.discover,
      component: DiscoverView,
      meta: { title: 'Discover' },
    },
    {
      path: '/matches',
      name: ROUTE_NAMES.matches,
      component: () => import('../views/MatchesView.vue'),
      meta: { title: 'Matches' },
    },
    {
      path: '/matches/:matchId',
      name: ROUTE_NAMES.chat,
      component: () => import('../views/ChatView.vue'),
      props: true,
      meta: { title: 'Chat', hideTabBar: true },
    },
    {
      path: '/profile',
      name: ROUTE_NAMES.profile,
      component: () => import('../views/ProfileView.vue'),
      meta: { title: 'Profile' },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: ROUTE_NAMES.discover } },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${APP_NAME}` : APP_NAME
})

/**
 * The one auth gate. Order matters:
 * 1. Ask the backend who is signed in, once, before deciding anything.
 * 2. Public pages (log in, sign up) are for signed-out visitors only.
 * 3. Everything else needs a session; the intended page rides along as
 *    `?redirect=` so logging in lands the visitor where they were going.
 */
router.beforeEach(async (to) => {
  const session = useSessionStore()
  if (session.status === 'unknown') await restoreAuSession()

  if (to.meta.public) {
    return session.isSignedIn ? { name: ROUTE_NAMES.discover } : true
  }
  if (!session.isSignedIn) {
    const intended =
      to.fullPath === '/' || to.name === ROUTE_NAMES.discover ? undefined : to.fullPath
    return { name: ROUTE_NAMES.login, query: intended ? { redirect: intended } : {} }
  }
  return true
})

export default router
