import { ShowcaseController } from '@/showcase/api/controller';

export async function GET() {
    return await ShowcaseController.getProducts();
}
