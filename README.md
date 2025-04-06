# README - Shin Gi Tai

![shingitai-logo](https://github.com/user-attachments/assets/8d01d751-8147-4ae3-b41b-ce8880fdad1f)

## Coverage

```
--------------------------|----------|----------|----------|----------|----------------|
File                      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
--------------------------|----------|----------|----------|----------|----------------|
 contracts/               |     98.8 |    65.85 |     97.3 |    98.15 |                |
  GradeManager.sol        |      100 |       75 |      100 |    96.55 |            100 |
  GradeSBT.sol            |    96.67 |    60.71 |    90.91 |    97.22 |            182 |
  IGradeSBT.sol           |      100 |      100 |      100 |      100 |                |
  IPresenceCounter.sol    |      100 |      100 |      100 |      100 |                |
  ParticipationSFT.sol    |      100 |    73.08 |      100 |      100 |                |
  PresenceCounter.sol     |      100 |       50 |      100 |      100 |                |
  PresenceCounterMock.sol |      100 |      100 |      100 |      100 |                |
--------------------------|----------|----------|----------|----------|----------------|
All files                 |     98.8 |    65.85 |     97.3 |    98.15 |                |
--------------------------|----------|----------|----------|----------|----------------|
```

## Installation

Before getting started, make sure you have the following prerequisites installed on your machine:

### Prerequisites

- **Node.js** (latest recommended version)
- **npm** or **yarn**
- **Hardhat**

### Installation Steps

1. Clone the project repository:
   ```sh
   git clone git@github.com:matrixise/alyra-shingitai.git
   cd alyra-shingitai
   ```

2. You have to go to the project directory:
   ```sh
   cd shingitai-backend
   ```

3. Install the necessary dependencies:
   ```sh
   npm install
   ```

4. Verify that Hardhat is installed by running:
   ```sh
   npx hardhat --version
   ```

## Execution and Debugging

### Start a Hardhat Node

To start a local Hardhat node, use the following command:

```sh
npx hardhat node
```

This will simulate a local blockchain network for development and testing purposes.

### Run Tests

To execute the project's test suite, run:

```sh
npx hardhat test
```

This will run all the defined tests to ensure your smart contract functions correctly.

### Deploy the Smart Contract Locally

You can deploy your smart contract on the local Hardhat network by running:

```sh
npx hardhat ignition deploy ignition/modules/Deployments.js --network localhost
```

This allows you to interact with your smart contract in a development environment.

### Deploy the Smart Contract on Sepolia

You can deploy your smart contract to the Sepolia test network using Hardhat. This allows you to test your contract in a public test environment.

### Prerequisites

- **Sepolia Test Network**: Ensure you have access to the Sepolia test network and have configured your Hardhat project with the necessary network settings.
- **ETH on Sepolia**: You need some Sepolia ETH to pay for deployment transactions. You can obtain Sepolia ETH from a faucet.

```sh
npx hardhat ignition deploy ignition/modules/Deployments.ts --network sepolia
```

---

## Using the Task File (Taskfile.yml)

The project uses a **task file** written in YAML to automate common Hardhat commands. This simplifies running tests,
launching a node, and deploying smart contracts.

### Installing `task`

To use the **task file**, you need to install `task` on your system. If you haven’t installed it yet, do so by running:

#### On macOS:

```sh
brew install go-task/tap/go-task
```

#### On Linux:

```sh
curl -sL https://taskfile.dev/install.sh | sh
```

#### On Windows:

Download and install **task** from [taskfile.dev](https://taskfile.dev/).

### Using the Task File

Once `task` is installed, you can execute the commands defined in the `Taskfile.yml` file.


#### First thing to do
```
task -l

task: Available tasks for this project:
* update-abi:                               Update the ABI everywhere.
* abi_generator:install:dependencies:       Install the dependencies
* all:install:dependencies:                 Install the dependencies for each project
* backend:compile:                          Compile the smart contract
* backend:coverage:                         Run the coverage
* backend:deploy:hardhat:                   Deploy the SCs on Hardhat
* backend:deploy:sepolia:                   Deploy on Sepolia
* backend:format:                           Run the formatting system
* backend:hardhat:node:                     Run a Hardhat Node
* backend:install:dependencies:             Install the dependencies
* backend:populate:hardhat:                 Populate SC
* backend:tests:                            Run the tests
* backoffice:format:                        Format the code
* backoffice:install:dependencies:          Install the dependencies
* backoffice:lint:                          Run the linter
* certificate:format:                       Format the code
* certificate:install:dependencies:         Install the dependencies
* certificate:lint:                         Run the linter
* github:actions:                           Run the Github Actions with act
* indexer:install:dependencies:             Install the dependencies
* indexer:run:                              Run the Ponder node
* member:format:                            Format the code
* member:install:dependencies:              Install the dependencies
* member:lint:                              Run the linter
* tools:badges:reduce-size:                 Reduce the size of the badges
* tools:badges:upload:                      Upload the Badges and Images to Pinata
* tools:install:dependencies:               Install the dependencies
* tools:update-all:                         Update all
* tools:update:populate:                    Update the populate
```

#### Install the dependencies

```sh
task backend:install:dependencies
```

#### Run Tests

```sh
task backend:tests
```

#### Start a Hardhat Node

```sh
task backend:hardhat:node
```

#### Deploy the Smart Contract on Hardhat

```sh
task backend:deploy:hardhat
```

### Deploying the Smart Contract

To deploy your smart contract to the Sepolia network, use the following command:

```sh
task backend:deploy:sepolia
```


Using `task` helps centralize and streamline the execution of essential project commands.

---

## Running Tests Locally with Act

You can use `act` to run your GitHub Actions workflows locally. This is useful for testing your CI/CD pipeline without
pushing changes to GitHub.

### Prerequisites

- **Docker**: Ensure Docker is installed and running on your machine.
- **Act**: You can download the binary from [GitHub releases](https://github.com/nektos/act/releases) or install it via
  Homebrew.

#### Installing Act

##### Via Homebrew (macOS/Linux)

```sh
brew install act
```

##### Download from GitHub Releases

1. Go to the [act releases page](https://github.com/nektos/act/releases).
2. Download the appropriate binary for your operating system.
3. Extract the binary and move it to a directory in your PATH.

### Running Tests with Act

Once `act` is installed, you can simulate your GitHub Actions workflows locally. Make sure Docker is running, as `act`
uses Docker to execute the workflows.

1. Navigate to the root of your project directory where the `.github/workflows` directory is located.
2. Run the following command to execute the default workflow:

```sh
act
```

3. If you have multiple workflows or need to specify an event, you can use:

```sh
act <event_name>
```

Replace `<event_name>` with the specific event you want to simulate, such as `push` or `pull_request`.

This setup allows you to test your workflows locally, ensuring they work as expected before committing changes to your
repository.

## Additional Resources

- [Official Hardhat Documentation](https://hardhat.org/docs/)
- [Taskfile.dev - Documentation](https://taskfile.dev/)
- [Act: Run your GitHub Actions locally 🚀](https://github.com/nektos/act)

