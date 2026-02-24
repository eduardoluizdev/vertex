export class CreateProposalItemDto {
  name!: string;
  description?: string;
  quantity!: number;
  unitPrice!: number;
}

export class CreateProposalDto {
  title!: string;
  status?: string;
  proposalDate?: string;
  followUpDate?: string;
  notes?: string;
  customerId!: string;
  items?: CreateProposalItemDto[];
}
