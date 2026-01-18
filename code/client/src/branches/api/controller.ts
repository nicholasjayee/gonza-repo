import { NextResponse } from 'next/server';
import { BranchService } from './service';

export const BranchController = {
    async getBranches() {
        const branches = await BranchService.fetchBranches();
        return NextResponse.json(branches);
    },
    async getEmployees(branchId: string) {
        const employees = await BranchService.fetchEmployees(branchId);
        return NextResponse.json(employees);
    }
};
