export const getDestinationSquare = (move:string): string | null  => {
    return move.match(/[a-h][1-8](?=[^a-zA-Z]*$)/)?.[0] || null;
};