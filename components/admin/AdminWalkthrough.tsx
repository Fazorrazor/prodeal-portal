'use client';

import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePathname } from 'next/navigation';

export function AdminWalkthrough() {
  const pathname = usePathname();
  const driverRef = useRef<any>(null);

  useEffect(() => {
    let tourKey = '';
    let steps: any[] = [];

    if (pathname === '/admin') {
      tourKey = 'prodeal_admin_tour_dashboard';
      steps = [
        {
          element: '#tour-sidebar',
          popover: {
            title: 'Workspace Navigation',
            description:
              'Switch between Overview, Inquiries, and Team management from the left navigation rail.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#tour-alerts',
          popover: {
            title: 'Live Notifications',
            description:
              'New client inquiries appear here in real time. Click any alert to open it immediately.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '#tour-metrics',
          popover: {
            title: 'Operations Metrics',
            description:
              'Track total inquiry volume, pending reviews, resolved tickets, and average response speed.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-recent-tickets',
          popover: {
            title: 'Recent Inquiries',
            description:
              'Review incoming client requests, bulk-select rows, or open any inquiry to prepare a quotation.',
            side: 'top',
            align: 'start',
          },
        },
      ];
    } else if (pathname === '/admin/tickets') {
      tourKey = 'prodeal_admin_tour_tickets';
      steps = [
        {
          element: '#tour-ticket-filters',
          popover: {
            title: 'Status Filters',
            description:
              'Filter inquiries by pipeline stage or press ⌘K in the top bar to search by client, company, or reference ID.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '#tour-ticket-table',
          popover: {
            title: 'Inquiries Directory',
            description:
              'Select any row to open the client profile, WhatsApp desk, and pro-forma quotation builder.',
            side: 'top',
            align: 'start',
          },
        },
      ];
    } else if (pathname === '/admin/staff') {
      tourKey = 'prodeal_admin_tour_staff';
      steps = [
        {
          element: '#tour-add-staff',
          popover: {
            title: 'Invite Team Members',
            description:
              'Provision staff accounts and assign their authorization roles here.',
            side: 'bottom',
            align: 'end',
          },
        },
        {
          element: '#tour-staff-table',
          popover: {
            title: 'Team Directory',
            description:
              'Edit division assignments, monitor live presence, or toggle account access anytime.',
            side: 'top',
            align: 'start',
          },
        },
      ];
    } else {
      return;
    }

    const hasSeenTour = localStorage.getItem(tourKey);
    if (hasSeenTour === 'true') return;

    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        disableActiveInteraction: true,
        allowKeyboardControl: true,
        overlayColor: 'rgba(10, 22, 40, 0.55)',
        popoverClass: 'minimalist-driver-popover',
        doneBtnText: 'Done',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        onHighlightStarted: (_element, step) => {
          document.body.style.overflow = 'hidden';
          const selector = typeof step?.element === 'string' ? step.element : '';
          if (selector) {
            const domNode = document.querySelector(selector);
            if (domNode) {
              document.body.style.overflow = '';
              domNode.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              setTimeout(() => {
                document.body.style.overflow = 'hidden';
              }, 400);
            }
          }
        },
        onDestroyStarted: () => {
          localStorage.setItem(tourKey, 'true');
          document.body.style.overflow = '';
          driverObj.destroy();
        },
        steps,
      });

      driverRef.current = driverObj;
      driverObj.drive();
    }, 1200);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
