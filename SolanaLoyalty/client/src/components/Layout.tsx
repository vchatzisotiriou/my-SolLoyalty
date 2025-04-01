import { ReactNode } from "react";
import Navigation from "./Navigation";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow bg-gray-50">{children}</main>
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">About</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Documentation</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">API</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Support</a>
            </div>
          </nav>
          <p className="mt-4 text-center text-base text-gray-500">
            Powered by Solana Blockchain Technology
          </p>
          <p className="mt-1 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SolLoyalty. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
