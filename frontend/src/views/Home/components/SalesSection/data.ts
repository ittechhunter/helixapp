import { SalesSectionProps } from '.'

export const swapSectionData: SalesSectionProps = {
    headingText: 'Trade anything. No registration, no hassle.',
    bodyText: 'Trade any token on Binance Smart Chain in seconds, just by connecting your wallet.',
    reverse: false,
    primaryButton: {
        to: '/swap',
        text: 'Trade Now',
        external: false,
    },
    secondaryButton: {
        to: 'https://docs.pancakeswap.finance/',
        text: 'Learn',
        external: true,
    },
    images: {
        path: '/images/home/trade/',
        attributes: [
            { src: 'BNB', alt: 'BNB token' },
            { src: 'BTC', alt: 'BTC token' },
            { src: 'HELIX', alt: 'HELIX token' },
        ],
    },
}

export const earnSectionData: SalesSectionProps = {
    headingText: 'Earn passive income with crypto.',
    bodyText: 'PancakeSwap makes it easy to make your crypto work for you.',
    reverse: true,
    primaryButton: {
        to: '/farms',
        text: 'Explore',
        external: false,
    },
    secondaryButton: {
        to: 'https://docs.pancakeswap.finance/products/yield-farming',
        text: 'Learn',
        external: true,
    },
    images: {
        path: '/images/home/earn/',
        attributes: [
            { src: 'pie', alt: 'Pie chart' },
            { src: 'stonks', alt: 'Stocks chart' },
            { src: 'folder', alt: 'Folder with HELIX token' },
        ],
    },
}

export const cakeSectionData: SalesSectionProps = {
    headingText: 'HELIX makes our world go round.',
    bodyText:
        'HELIX token is at the heart of the PancakeSwap ecosystem. Buy it, win it, farm it, spend it, stake it... heck, you can even vote with it!',
    reverse: false,
    primaryButton: {
        to: '/swap?outputCurrency=0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
        text: 'Buy HELIX',
        external: false,
    },
    secondaryButton: {
        to: 'https://docs.pancakeswap.finance/tokenomics/cake',
        text: 'Learn',
        external: true,
    },

    images: {
        path: '/images/home/cake/',
        attributes: [
            { src: 'bottom-right', alt: 'Small 3d pancake' },
            { src: 'top-right', alt: 'Small 3d pancake' },
            { src: 'coin', alt: 'HELIX token' },
            { src: 'top-left', alt: 'Small 3d pancake' },
        ],
    },
}
