'use client';

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePathname } from 'next/navigation';

export function AdminWalkthrough() {
  const pathname = usePathname();

  useEffect(() => {
    // Determine the current page key and steps
    let tourKey = '';
    let steps: any[] = [];

    if (pathname === '/admin') {
      tourKey = 'prodeal_admin_tour_dashboard';
      steps = [
        {
          element: '#tour-sidebar',
          popover: { title: 'Navigation Hub', description: 'This is your command center. Access tickets, staff management, and division settings from this sidebar.', side: 'right', align: 'start' }
        },
        {
          element: '#tour-alerts',
          popover: { title: 'Real-time Alerts', description: 'Instant notifications for new inquiries drop here. Click the bell to view and instantly dismiss them.', side: 'bottom', align: 'end' }
        },
        {
          element: '#tour-metrics',
          popover: { title: 'Performance Metrics', description: 'A quick, high-level overview of ticket volume and resolution speed across your assigned divisions.', side: 'bottom', align: 'start' }
        },
        {
          element: '#tour-recent-tickets',
          popover: { title: 'Recent Inquiries', description: 'The latest customer requests. Use the checkboxes to bulk-select and delete, or click any ticket to view full details.', side: 'top', align: 'start' }
        }
      ];
    } else if (pathname === '/admin/tickets') {
      tourKey = 'prodeal_admin_tour_tickets';
      steps = [
        {
          element: '#tour-ticket-filters',
          popover: { title: 'Filter Engine', description: 'Quickly filter tickets by status (New, In Progress, Closed) or search by ID, name, or phone number.', side: 'bottom', align: 'end' }
        },
        {
          element: '#tour-ticket-table',
          popover: { title: 'Master Ticket List', description: 'All your division inquiries live here. Click on any row to open the full ticket details and manage its status.', side: 'top', align: 'start' }
        }
      ];
    } else if (pathname === '/admin/staff') {
      tourKey = 'prodeal_admin_tour_staff';
      steps = [
        {
          element: '#tour-add-staff',
          popover: { title: 'Onboard Staff', description: 'Add new staff members here. Assign them specific roles and link them directly to divisions so they get routed the correct inquiries.', side: 'bottom', align: 'end' }
        },
        {
          element: '#tour-staff-table',
          popover: { title: 'Staff Roster', description: 'Manage existing staff access. You can edit their roles, change their division assignments, or temporarily deactivate their accounts using the toggle switches.', side: 'top', align: 'start' }
        }
      ];
    } else {
      return; // No tour for this page
    }

    // Check localStorage to ensure this only runs once per device per page
    const hasSeenTour = localStorage.getItem(tourKey);
    if (hasSeenTour === 'true') return;

    // Delay to ensure the entire DOM and animations have settled (especially Suspense boundaries)
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: false, // Forces them to interact with the tour
        overlayColor: 'rgba(9, 25, 43, 0.85)', // brand-deep-blue
        popoverClass: 'brutalist-driver-popover',
        doneBtnText: 'Finish Tour',
        nextBtnText: 'Next →',
        prevBtnText: '← Prev',
        onHighlightStarted: (element, step) => {
          // Robust scroll focus logic
          const selector = typeof step?.element === 'string' ? step.element : '';
          if (selector) {
            const domNode = document.querySelector(selector);
            if (domNode) {
              // Scroll the container so the element is perfectly in the center of the screen
              domNode.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
          }
        },
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the walkthrough?")) {
            // Set completion flag in localStorage
            localStorage.setItem(tourKey, 'true');
            driverObj.destroy();
          }
        },
        steps
      });

      driverObj.drive();
    }, 1500); // 1.5s delay to allow Suspense boundaries (tables) to load

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
