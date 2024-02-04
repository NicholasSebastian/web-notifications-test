export function isValidSubscription(arg: any): arg is Subscription {
  return arg && arg.endpoint;
}

export type Subscription = {
  endpoint: string;
  expirationTime: any;
  keys: {
    p256dh: string;
    auth: string;
  };
};
