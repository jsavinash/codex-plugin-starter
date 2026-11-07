# Data sovereignty policy

The included checks compare caller-declared regions to a sample allowlist. They cannot inspect an upstream provider's actual compute location or enforce where requests are routed. Replace the sample with reviewed organization policy and enforce it in the gateway/identity layer that controls the network request.
