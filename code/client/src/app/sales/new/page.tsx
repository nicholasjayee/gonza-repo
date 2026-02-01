import { Metadata } from "next";
import NewSalePage from "@/sales/ui/pages/NewSalePage";

export const metadata: Metadata = {
    title: 'New Sale | Gonza',
    description: 'Create a new sale transaction.',
};


type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: Props) {
    const params = await searchParams;
    const id = typeof params.id === 'string' ? params.id : undefined;
    
    return <NewSalePage saleId={id} />;
}
