import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { EhsaanLogo } from './EhsaanLogo';

export const EhsaanOdooShowcase: React.FC = () => {
  return (
    <section className="w-full mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 material:border-amber-200/80">
      <div
        id="ehsaan-odoo-showcase-card"
        className="relative overflow-hidden rounded-2xl bg-[#B1BD70] border border-[#9ea963] text-zinc-950 shadow-lg p-3.5 sm:p-4.5 transition-colors duration-200"
      >
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4">
          {/* Left content: Logo + Title + concise description */}
          <div className="flex items-center gap-3 min-w-0">
            <EhsaanLogo size={32} className="ring-2 ring-black/10 shadow-sm shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold tracking-tight text-zinc-950">
                  Ehsaan <span className="font-medium text-zinc-800/80">on Odoo</span>
                </h3>
                <span className="text-[10px] text-zinc-800 bg-black/10 border border-black/10 px-2 py-0.5 rounded-full font-mono font-medium">
                  ehsaan.odoo.com
                </span>
              </div>
              <p className="text-xs text-zinc-800 font-medium truncate sm:max-w-md mt-0.5">
                Enterprise software, cloud ERP
              </p>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end">
            <a
              href="https://ehsaan.odoo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 text-white font-semibold text-xs hover:bg-black transition-all shadow-md active:scale-95 group"
            >
              <span>Explore ehsaan.odoo.com</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
