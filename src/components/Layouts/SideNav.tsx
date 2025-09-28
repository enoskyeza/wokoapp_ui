"use client"
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    TransitionChild,
} from "@headlessui/react";
import {Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import {ChevronRightIcon} from '@heroicons/react/20/solid'

import {motion} from "framer-motion";

import {
    Cog6ToothIcon,
    HomeIcon,
    XMarkIcon,
    DocumentTextIcon, ScaleIcon, ChatBubbleBottomCenterTextIcon, ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";
import {usePathname} from 'next/navigation';
import Image from "next/image";
// import {DocumentTextIcon} from "@heroicons/react/24/solid";
// import {useAuth} from "@/providers/AuthProvider";
// import {getNavigationByRoleAndDepartment} from "@/utils/navbar/navUtils";


type SideNavProps = {
    sideBar: boolean;
    setSideBar: React.Dispatch<React.SetStateAction<boolean>>;
};


const programs = [
    {id: 1, name: "Membership", href: "/members", initial: "M", current: false},
    // {id: 2, name: "Affiliate", href: "#", initial: "A", current: false},
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}


const SideNav = ({sideBar, setSideBar}: SideNavProps) => {
    // const auth = useAuth()

    const pathname = usePathname();
    // const navigation = getNavigationByRoleAndDepartment(auth.userRole, auth.userDepartment, auth.userDesignation, pathname)

    const navigation = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: HomeIcon,
        current: pathname.startsWith("/dashboard"),
      },
      {
        name: "Register",
        href: "/register",
        icon: ClipboardDocumentListIcon,
        current: pathname.startsWith("/register"),
      },
      {
        name: "Judge Panel",
        // href: "/judge_panel",
        icon: ScaleIcon,
        current: pathname.startsWith("/judge_panel"),
        children: [
          {
            name: "Scores",
            href: "/judge_panel",
            current: pathname.startsWith("/judge_panel"),
          },
          {
            name: "Rubics",
            href: "#",
            current: pathname.startsWith("/rubic"),
          },
          {
            name: "Results",
            href: "/judge_panel/results",
            current: pathname.startsWith("/rubic"),
          },
        ],
      },
      {
        name: "Receipts",
        href: "/receipts",
        icon: DocumentTextIcon,
        current: pathname.startsWith("/receipts"),
      },
      {
        name: "Sms",
        href: "/sms",
        icon: ChatBubbleBottomCenterTextIcon,
        current: pathname.startsWith("/sms"),
      },
    ];

    return (
        <>
            <Dialog
                open={sideBar}
                onClose={setSideBar}
                className="relative z-50 lg:hidden"
            >
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                />

                <div className="fixed inset-0 flex">
                    <DialogPanel
                        transition
                        className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                    >
                        <TransitionChild>
                            <div
                                className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                                <button
                                    type="button"
                                    onClick={() => setSideBar(false)}
                                    className="-m-2.5 p-2.5"
                                >
                                    <span className="sr-only">Close sidebar</span>
                                    <XMarkIcon
                                        aria-hidden="true"
                                        className="h-6 w-6 text-white"
                                    />
                                </button>
                            </div>
                        </TransitionChild>

                        {/* Sidebar component, swap this element with another sidebar if you like */}
                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                            <div className="flex h-16 gap-3 shrink-0 items-center">
                                <Image
                                    alt="WokoApp"
                                    src="/logo.png"
                                    width={64}
                                    height={32}
                                    className="h-8 w-16"
                                />
                                <h3 className="font-bold text-blue-600">WokoApp</h3>
                            </div>
                            <nav className="flex flex-1 flex-col">
                                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                    <li>
                                        <ul role="list" className="-mx-2 space-y-1">
                                            {navigation.map((item) => {
                                                const isChildActive = item.children && item.children.some((subItem) => pathname.startsWith(subItem.href));

                                                return (
                                                    <li key={item.name} className="relative">
                                                        {item.current && (
                                                            <motion.span
                                                                layoutId="current-indicator"
                                                                className="absolute inset-y-2 -left-3.5 w-[3px] rounded-full bg-blue-600 dark:bg-blue-50"
                                                            />
                                                        )}
                                                        {!item.children ? (

                                                            <a
                                                                href={item.href}
                                                                className={classNames(
                                                                    item.current
                                                                        ? "bg-gray-50 text-blue-600"
                                                                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                                                                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                                                                )}
                                                            >
                                                                <item.icon
                                                                    aria-hidden="true"
                                                                    className={classNames(
                                                                        item.current
                                                                            ? "text-blue-600"
                                                                            : "text-gray-400 group-hover:text-blue-600",
                                                                        "h-6 w-6 shrink-0"
                                                                    )}
                                                                />
                                                                {item.name}
                                                            </a>
                                                        ) : (
                                                            <Disclosure as="div" defaultOpen={isChildActive || item.current}>
                                                        {({open}) => (
                                                            <>
                                                                <span className="hidden">{open}</span>
                                                                <DisclosureButton
                                                                    className={classNames(
                                                                        item.current
                                                                            ? "bg-gray-50 text-blue-600"
                                                                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                                                                        'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 text-gray-700',
                                                                    )}
                                                                >
                                                                    <item.icon aria-hidden="true"
                                                                               className={classNames(
                                                                                   item.current
                                                                                       ? "text-blue-600"
                                                                                       : "text-gray-400 group-hover:text-blue-600",
                                                                                   "h-6 w-6 shrink-0"
                                                                               )}/>
                                                                    {item.name}
                                                                    <ChevronRightIcon
                                                                        aria-hidden="true"
                                                                        className="ml-auto h-5 w-5 shrink-0 text-gray-400 group-data-[open]:rotate-90 group-data-[open]:text-gray-500"
                                                                    />
                                                                </DisclosureButton>
                                                                <DisclosurePanel as="ul" className="mt-1 px-2">
                                                                    {item.children.map((subItem) => (
                                                                        <li key={subItem.name}>
                                                                            <DisclosureButton
                                                                                as="a"
                                                                                href={subItem.href}
                                                                                className={classNames(
                                                                                    subItem.current ? 'bg-gray-50' : 'hover:bg-gray-50',
                                                                                    'block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-700',
                                                                                )}
                                                                            >
                                                                                {subItem.name}
                                                                            </DisclosureButton>
                                                                        </li>
                                                                    ))}
                                                                </DisclosurePanel>
                                                            </>
                                                        )}
                                                            </Disclosure>
                                                        )}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </li>
                                    <li>
                                        <div className="text-xs font-semibold leading-6 text-gray-400">
                                            Programs
                                        </div>
                                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                                            {programs.map((item) => (
                                                <li key={item.name}>
                                                    <a
                                                        href={item.href}
                                                        className={classNames(
                                                            item.current
                                                                ? "bg-gray-50 text-blue-600"
                                                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                                                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                                                        )}
                                                    >
                            <span
                                className={classNames(
                                    item.current
                                        ? "border-blue-600 text-blue-600"
                                        : "border-gray-200 text-gray-400 group-hover:border-blue-600 group-hover:text-blue-600",
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium"
                                )}
                            >
                              {item.initial}
                            </span>
                                                        <span className="truncate">{item.name}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                    <li className="mt-auto">
                                        <a
                                            href="#"
                                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                        >
                                            <Cog6ToothIcon
                                                aria-hidden="true"
                                                className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-blue-600"
                                            />
                                            Settings
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
                    <div className="flex h-16 gap-3 shrink-0 items-center">
                        <Image
                            alt="WokoApp"
                            src="/logo.png"
                            width={64}
                            height={32}
                            className="h-8 w-auto"
                        />
                        <h3 className="font-bold text-blue-600">WokoApp</h3>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => {
                                        const isChildActive = item.children && item.children.some((subItem) => pathname.startsWith(subItem.href));

                                        return (
                                            <li key={item.name} className="relative">
                                                {item.current && (
                                                    <motion.span
                                                        layoutId="current-indicator"
                                                        className="absolute inset-y-2 -left-3.5 w-[3px] rounded-full bg-blue-600 dark:bg-blue-50"
                                                    />
                                                )}

                                                {!item.children ? (
                                                    <a
                                                        href={item.href}
                                                        className={classNames(
                                                            item.current
                                                                ? "bg-gray-50 text-blue-600"
                                                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                                                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                                                        )}
                                                    >
                                                        <item.icon
                                                            aria-hidden="true"
                                                            className={classNames(
                                                                item.current
                                                                    ? "text-blue-600"
                                                                    : "text-gray-400 group-hover:text-blue-600",
                                                                "h-6 w-6 shrink-0"
                                                            )}
                                                        />
                                                        {item.name}
                                                    </a>
                                                ):(
                                                    <Disclosure as="div" defaultOpen={isChildActive || item.current}>
                                                        {({open}) => (
                                                            <>
                                                                <span className="hidden">{open}</span>
                                                                <DisclosureButton
                                                                    className={classNames(
                                                                        item.current
                                                                            ? "bg-gray-50 text-blue-600"
                                                                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                                                                        'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 text-gray-700',
                                                                    )}
                                                                >
                                                                    <item.icon aria-hidden="true"
                                                                               className={classNames(
                                                                                   item.current
                                                                                       ? "text-blue-600"
                                                                                       : "text-gray-400 group-hover:text-blue-600",
                                                                                   "h-6 w-6 shrink-0"
                                                                               )}/>
                                                                    {item.name}
                                                                    <ChevronRightIcon
                                                                        aria-hidden="true"
                                                                        className="ml-auto h-5 w-5 shrink-0 text-gray-400 group-data-[open]:rotate-90 group-data-[open]:text-gray-500"
                                                                    />
                                                                </DisclosureButton>
                                                                <DisclosurePanel as="ul" className="mt-1 px-2">
                                                                    {item.children.map((subItem) => (
                                                                        <li key={subItem.name}>
                                                                            <DisclosureButton
                                                                                as="a"
                                                                                href={subItem.href}
                                                                                className={classNames(
                                                                                    subItem.current ? 'bg-gray-50' : 'hover:bg-gray-50',
                                                                                    'block rounded-md py-2 pl-9 pr-2 text-sm leading-6 text-gray-700',
                                                                                )}
                                                                            >
                                                                                {subItem.name}
                                                                            </DisclosureButton>
                                                                        </li>
                                                                    ))}
                                                                </DisclosurePanel>
                                                            </>
                                                        )}
                                                    </Disclosure>
                                                )}
                                            </li>)
                                    })}
                                </ul>
                            </li>
                            <li>
                                <div className="text-xs font-semibold leading-6 text-gray-400">
                                    Your teams
                                </div>
                                <ul role="list" className="-mx-2 mt-2 space-y-1">
                                    {programs.map((item) => (
                                        <li key={item.name}>
                                            <a
                                                href={item.href}
                                                className={classNames(
                                                    item.current
                                                        ? "bg-gray-50 text-blue-600"
                                                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                                                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                                                )}
                                            >
                        <span
                            className={classNames(
                                item.current
                                    ? "border-blue-600 text-blue-600"
                                    : "border-gray-200 text-gray-400 group-hover:border-blue-600 group-hover:text-blue-600",
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium"
                            )}
                        >
                          {item.initial}
                        </span>
                                                <span className="truncate">{item.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <a
                                    href="#"
                                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                >
                                    <Cog6ToothIcon
                                        aria-hidden="true"
                                        className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-blue-600"
                                    />
                                    Settings
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}

export default SideNav
