import { TransactionTypes } from "../enums";
import { TransactionAlreadyRegisteredError, UnkownTransactionError } from "../errors";
import { validator } from "../validation";
import {
    DelegateRegistrationTransaction,
    DelegateResignationTransaction,
    HtlcClaimTransaction,
    HtlcLockTransaction,
    HtlcRefundTransaction,
    IpfsTransaction,
    MultiPaymentTransaction,
    MultiSignatureRegistrationTransaction,
    SecondSignatureRegistrationTransaction,
    Transaction,
    TransactionTypeFactory,
    TransferTransaction,
    VoteTransaction,
} from "./types";
import { InternalTransactionType } from "./types/internal-transaction-type";

export type TransactionConstructor = typeof Transaction;

class TransactionRegistry {
    private readonly transactionTypes: Map<InternalTransactionType, TransactionConstructor> = new Map();

    constructor() {
        TransactionTypeFactory.initialize(this.transactionTypes);

        this.registerTransactionType(TransferTransaction);
        this.registerTransactionType(SecondSignatureRegistrationTransaction);
        this.registerTransactionType(DelegateRegistrationTransaction);
        this.registerTransactionType(VoteTransaction);
        this.registerTransactionType(MultiSignatureRegistrationTransaction);
        this.registerTransactionType(IpfsTransaction);
        this.registerTransactionType(MultiPaymentTransaction);
        this.registerTransactionType(DelegateResignationTransaction);
        this.registerTransactionType(HtlcLockTransaction);
        this.registerTransactionType(HtlcClaimTransaction);
        this.registerTransactionType(HtlcRefundTransaction);
    }

    public registerTransactionType(constructor: TransactionConstructor): void {
        const { chainId, type } = constructor;
        const internalType: InternalTransactionType = InternalTransactionType.from(type, chainId);
        if (this.transactionTypes.has(internalType)) {
            throw new TransactionAlreadyRegisteredError(constructor.name);
        }

        this.transactionTypes.set(internalType, constructor);
        this.updateSchemas(constructor);
    }

    public deregisterTransactionType(constructor: TransactionConstructor): void {
        const { chainId, type } = constructor;
        const internalType: InternalTransactionType = InternalTransactionType.from(type, chainId);

        if (!this.transactionTypes.has(internalType)) {
            throw new UnkownTransactionError(internalType.toString());
        }

        if (type in TransactionTypes) {
            throw new Error("Cannot deregister Core type.");
        }

        const schema = this.transactionTypes.get(internalType);
        this.updateSchemas(schema, true);
        this.transactionTypes.delete(internalType);
    }

    private updateSchemas(transaction: TransactionConstructor, remove?: boolean): void {
        validator.extendTransaction(transaction.getSchema(), remove);
    }
}

export const transactionRegistry = new TransactionRegistry();
