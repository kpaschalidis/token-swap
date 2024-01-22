export const networks: { [key: string]: number } = {
    Mainet: 1,
    Ropsten: 3,
    Rinkeby: 4,
}

export const getNetworkNameById = (id: number) => {
    for (let key in networks) {
        if (networks[key] === id) {
            return key;
        }
    }

    return 'Unsupported';
}