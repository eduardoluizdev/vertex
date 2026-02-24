export class UpdateProposalItemDto {
  id?: string;
  name!: string;
  description?: string;
  quantity!: number;
  unitPrice!: number;
}

export class UpdateProposalDto {
  title?: string;
  status?: string;
  proposalDate?: string;
  followUpDate?: string;
  notes?: string;
  customerId?: string;
  items?: UpdateProposalItemDto[];
}
