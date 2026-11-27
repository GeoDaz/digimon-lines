export interface AlysionCardDetails {
	dp?: number;
	cost?: number;
	digivolve?: Array<[string | null, number | null, number]>;
	form?: string;
	attribute?: string;
	traits?: string;
	effect?: string;
	inherited?: string;
	security?: string;
}

let cache: Promise<Record<string, AlysionCardDetails>> | null = null;

export const loadAlysionDetails = (): Promise<Record<string, AlysionCardDetails>> =>
	(cache ??= fetch('/json/alysion/cards.json')
		.then(response => {
			if (!response.ok) throw new Error('Failed to load the card details');
			return response.json() as Promise<Record<string, AlysionCardDetails>>;
		})
		.catch(error => {
			cache = null;
			throw error;
		}));
