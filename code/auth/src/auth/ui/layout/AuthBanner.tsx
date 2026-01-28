import React from 'react';
import Image from 'next/image';
import bannerImage from '@gonza/shared/assets/banner_02.png';

interface AuthBannerProps {
    title: string;
    highlight: string;
    description: string;
}

export default function AuthBanner({ title, highlight, description }: AuthBannerProps) {
    return (
        <div className="hidden lg:flex w-1/2 relative bg-sales-primary overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src={bannerImage}
                    alt="Gonza Systems"
                    fill
                    className="object-cover opacity-40 mix-blend-overlay"
                    priority
                />
            </div>
            <div className="absolute inset-0 opacity-20 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-accent/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-sales-secondary/30 blur-[120px]" />
            </div>
            <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">G</span>
                    </div>
                    <span className="text-primary-foreground font-bold text-xl tracking-tight">Gonza Systems</span>
                </div>
                <div>
                    <h1 className="text-5xl font-bold text-primary-foreground leading-tight">
                        {title} <br />
                        <span className="text-sales-accent italic">{highlight}</span>
                    </h1>
                    <p className="text-primary-foreground/70 mt-6 max-w-lg text-lg leading-relaxed">
                        {description}
                    </p>
                </div>
                <div className="text-primary-foreground/50 text-sm">
                    © 2026 Gonza Systems Global Ltd.
                </div>
            </div>
        </div>
    );
}
