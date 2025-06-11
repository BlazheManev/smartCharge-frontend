export interface Station {
  id: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lon: number;
  };
  availability: {
    type: string;
    total: number;
    availability: {
      current: {
        available: number;
        occupied: number;
        reserved: number;
        unknown: number;
        outOfService: number;
      };
    };
  }[];
  fetched_at: string;
}
