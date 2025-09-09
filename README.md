# EV Battery Swap Platform

## Overview

A platform for managing and operating an EV battery swapping system.  
Supports three main roles:

- **EV Driver**
- **Battery Swap Station Staff**
- **Administrator**

## Key Features

### 👤 EV Driver

- Register & manage account.
- Link vehicle (VIN, battery type).
- Find the nearest swap station.
- Check battery availability.
- Book a battery swap in advance.
- Pay per swap or via subscription package.
- Manage invoices & history.
- Request support for issues.
- Rate station service.

### 🏭 Station Staff

- Manage battery inventory:
  - Full
  - Charging
  - Maintenance status.
- Confirm and log battery swap transactions.
- Track returned battery condition.
- Process on-site payments.

### 🛠️ Administrator

- Monitor battery health (SoH).
- Coordinate battery allocation across stations.
- Manage customers, subscription packages, and staff permissions.
- Generate reports on:
  - Revenue
  - Swap frequency
  - Peak hours
- Utilize AI-powered demand forecasting for station infrastructure upgrades.

## Tech Stack

- **Backend:** .NET 6+ (REST API)
- **Frontend:** React (Web & Mobile Web)
- **Database:** SQL Server / PostgreSQL
- **Analytics & AI (optional):** Python

## Installation
