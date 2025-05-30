import * as React from 'react';

import bugsnacks from '@/assets/bugsnacks.svg';
import caterpillar from '@/assets/caterpillar.svg';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const data = {
  navMain: [
    {
      title: 'For Debuggers',
      url: `${window.origin}`, // modify this url once page (and route) are created
      id: 'forDebugger',
      items: [
        {
          title: 'Bug Hunt',
          url: `${window.origin}/requests`,
          isActive: false,
        },
      ],
    },
    {
      title: 'For Developers',
      url: '#',
      id: 'forDeveloper',
      items: [
        {
          title: 'Projects',
          url: `${window.origin}/projects`,
          isActive: false,
        },
        {
          title: 'View Bugs',
          id: 'viewBugsButton',
          url: `${window.origin}/bugs`, // modify this page to fit the sidebar structure
          isActive: false,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={window.location.origin}>
                <div className="text-sidebar-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg">
                  <img src={caterpillar} alt="caterpillar" className="size-12" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <img
                    src={bugsnacks}
                    alt="bugsnacks"
                    className="w-full max-w-[150px] h-auto"
                  />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem id={item.id} key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium">
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={item.isActive}
                          id={item.id}
                        >
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
