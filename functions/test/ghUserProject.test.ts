describe("GhUserProject", () => {
  const resp = {
    data: {
      aws: {
        edges: [
          {
            node: {
              repositories: {
                edges: [
                  {
                    node: {
                      id: "MDEwOlJlcG9zaXRvcnkzMjA2MzIyODg=",
                      name: "cta",
                      description:
                        "Code translation assistance, a feature of Porting Assistant for .NET, helps users automate some aspects of their porting experience using a set of predefined rules and actions."
                    }
                  },
                  {
                    node: {
                      id: "MDEwOlJlcG9zaXRvcnkzMTczMzk4NTA=",
                      name: "jsii-runtime-go",
                      description: null
                    }
                  },
                  {
                    node: {
                      id: "MDEwOlJlcG9zaXRvcnkzMTU3NjMyODA=",
                      name: "aws-lambda-runtime-interface-emulator",
                      description: null
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      google: {
        edges: [
          {
            node: {
              repositories: {
                edges: [
                  {
                    node: {
                      id: "MDEwOlJlcG9zaXRvcnkzMjY5NjE5ODc=",
                      name: "aidl-language",
                      description: "VSCode extension providing syntax highlighting for AIDL, the Android Interface Definition Language."
                    }
                  },
                  {
                    node: {
                      id: "MDEwOlJlcG9zaXRvcnkzMjM2NTI4MjI=",
                      name: "fedjax",
                      description: "FedJAX is a library for developing custom Federated Learning (FL) algorithms in JAX."
                    }
                  },
                  {
                    node: {
                      id: "MDEwOlJlcG9zaXRvcnkzMjE4OTIzNTQ=",
                      name: "device-access-sample-web-app",
                      description: null
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    }
  };

  const expectedFeedEntries = [
    {
      id: "MDEwOlJlcG9zaXRvcnkzMjA2MzIyODg=",
      url: "https://github.com/aws/cta",
      created: 0,
      title: "aws: cta",
      body: "Code translation assistance, a feature of Porting Assistant for .NET, helps users automate some aspects of their porting experience using a set of predefined rules and actions."
    },
    {
      id: "MDEwOlJlcG9zaXRvcnkzMTczMzk4NTA=",
      url: "https://github.com/aws/jsii-runtime-go",
      created: 0,
      title: "aws: jsii-runtime-go",
      body: ""
    },
    {
      id: "MDEwOlJlcG9zaXRvcnkzMTU3NjMyODA=",
      url: "https://github.com/aws/aws-lambda-runtime-interface-emulator",
      created: 0,
      title: "aws: aws-lambda-runtime-interface-emulator",
      body: ""
    },
    {
      id: "MDEwOlJlcG9zaXRvcnkzMjY5NjE5ODc=",
      url: "https://github.com/google/aidl-language",
      created: 0,
      title: "google: aidl-language",
      body: "VSCode extension providing syntax highlighting for AIDL, the Android Interface Definition Language."
    },
    {
      id: "MDEwOlJlcG9zaXRvcnkzMjM2NTI4MjI=",
      url: "https://github.com/google/fedjax",
      created: 0,
      title: "google: fedjax",
      body: "FedJAX is a library for developing custom Federated Learning (FL) algorithms in JAX."
    },
    {
      id: "MDEwOlJlcG9zaXRvcnkzMjE4OTIzNTQ=",
      url: "https://github.com/google/device-access-sample-web-app",
      created: 0,
      title: "google: device-access-sample-web-app",
      body: ""
    }
  ];

  it("test", () => {
    const result = Object.entries(resp.data).flatMap(([username, entry]) =>
      entry.edges.flatMap((e) =>
        e.node.repositories.edges.map(({ node: { id, name, description } }) => ({
          id,
          url: `https://github.com/${username}/${name}`,
          created: 0,
          title: `${username}: ${name}`,
          body: description ?? ""
        }))
      )
    );
    expect(result).toEqual(expectedFeedEntries);
  });
});
