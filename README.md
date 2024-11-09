# A51 Rebalancing Bot

The **A51 Rebalancing Bot** is a backend service developed using **NestJS**, a progressive Node.js framework. The bot is designed to handle rebalancing tasks and manage various contract interactions related to liquidity, rebase checking, and queue management. It includes features such as scheduling tasks via cron jobs, interacting with contracts, managing queues, and more.

## Features

- **Automated Rebalance Logic**: Handles automated rebalancing of liquidity pools based on pre-defined logic.
- **Rebase Checking**: Checks and processes rebase events for liquidity pools.
- **Cron Jobs**: Schedules and runs automated tasks at specific intervals to manage liquidity and other operations.
- **Queue Management**: Utilizes Redis queues for managing tasks and job executions.
- **Database Integration**: Supports database operations for persisting data related to rebalancing tasks.
- **Subgraph Interaction**: Fetches data from the subgraph to assist in decision-making for liquidity management.

## Project Structure

```bash
src/
├── bot/                # Core logic for the rebalancing bot
├── common/             # Common utilities and shared modules
├── config/             # Configuration files for environment variables and services
├── contracts/          # Interaction logic with smart contracts
├── cron/               # Cron jobs for scheduling tasks
├── database/           # Database integration for task persistence
├── queues/             # Queue management and Redis-based task execution
├── subgraph/           # Interaction with subgraph for data fetching
└── main.ts             # Application entry point
```

## Key Components
- bot/: Contains the main logic for the rebalancing bot and rebase checking.
- cron/: Manages scheduled jobs for triggering rebalancing logic at regular intervals.
- contracts/: Handles all the contract-related interactions, such as fetching liquidity data and executing rebase actions.
- queues/: Implements task queues using Redis for asynchronous job processing.
- subgraph/: Fetches essential data from the blockchain subgraph, such as liquidity metrics and price information.

## Installation
To set up the project locally, follow these steps:

## Prerequisites
Ensure you have the following installed:

- Node.js (v14.x or higher)
- Yarn (v1.x or higher)
- Redis (for queue management)

## Steps
1. Clone the repository:
```
git clone https://github.com/a51finance/a51-rebalancing-bot.git
cd a51-rebalancing-bot
```
2. Install dependencies:
```
yarn install
```
3. Configure environment variables: Copy the example environment configuration and set the necessary values for your setup:
```
cp .env.example .env
```
4. Run the application:
```
yarn start:dev

```
## Usage
Once the bot is running, it will automatically start processing tasks based on the configured cron jobs and queue logic. Some of the key functionalities include:

- Rebalance Liquidity: Automatically adjust liquidity positions based on the current market data and predefined thresholds.
- Rebase Check Logic: Monitors the state of liquidity pools and triggers rebase actions when conditions are met.
- Queue Management: Utilizes Redis to manage asynchronous job execution and retries.

## Configuration
The application uses environment variables to configure various aspects of its operation. These are set in the .env file:

- REDIS_URL: URL for Redis server (used for task queues).
- DATABASE_URL: Connection string for the database.
- API_KEY: API keys for accessing third-party services, if required.

## Contributing
Contributions are welcome! To contribute to this project:

- Fork the repository.
- Create a new branch (git checkout -b feature-branch).
- Commit your changes (git commit -m 'Add new feature').
- Push to the branch (git push origin feature-branch).
- Open a pull request.
