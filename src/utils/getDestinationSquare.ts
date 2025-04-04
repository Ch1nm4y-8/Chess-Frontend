export const getDestinationSquare = (move:string): string | null  => {
    return move.match(/[a-h][1-8]$/)?.[0] || null;
};