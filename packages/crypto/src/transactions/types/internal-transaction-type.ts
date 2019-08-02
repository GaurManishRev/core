import { ChainId } from "../../enums";

export class InternalTransactionType {
    public static from(type: number, chainId?: number): InternalTransactionType {
        if (chainId === undefined) {
            chainId = ChainId.Core;
        }

        const compositeType: string = `${chainId}-${type}`;
        if (!this.types.has(compositeType)) {
            this.types.set(compositeType, new InternalTransactionType(type, chainId));
        }

        return this.types.get(compositeType);
    }

    private static types: Map<string, InternalTransactionType> = new Map();

    private compositeType: string;
    private constructor(public readonly type: number, public readonly chainId: number) {
        this.compositeType = `${chainId}-${type}`;
    }

    public toString(): string {
        return this.compositeType;
    }
}
