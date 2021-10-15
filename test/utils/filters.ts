import { BaseContract, ContractTransaction } from "@ethersproject/contracts";
import type { TypedEventFilter, TypedEvent, TypedListener } from "../../typechain/common";


interface CanFilter {
    queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
        event: TypedEventFilter<EventArgsArray, EventArgsObject>,
        fromBlockOrBlockhash?: string | number | undefined,
        toBlock?: string | number | undefined
    ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;
}


export async function filterEvents<EventArgsArray extends Array<any>, EventArgsObject>(
    query: CanFilter,
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    contract: ContractTransaction
): Promise<TypedEvent<EventArgsArray & EventArgsObject>> {

    let filterResults = await query.queryFilter(event, contract.blockHash)

    let resultIndex = filterResults.findIndex(x => x.transactionHash == contract.hash)
    if (resultIndex == -1) {
        throw new Error(`Failed to find filtered events`)
    }
    if (resultIndex >= 2) {
        throw new Error(`Found 2 or more possible events.`)
    }
    return filterResults[resultIndex]

}
