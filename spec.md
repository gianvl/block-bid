# BlockBid: A Sealed-Bid Auction System Using Commit-Reveal on Blockchain

_In Partial Fulfillment of the Requirements for the Degree Bachelor of Science in Computer Science_

**By:**

- Cinco, Theolo Seanon Paul
- Limbaga, Gian Vince
- Razote, Jazleen

**May 2026**

---

## Table of Contents

- [Abstract](#abstract)
- [I. Introduction](#i-introduction)
  - [1.1 Background of the Study](#11-background-of-the-study)
  - [1.2 Problem Statement](#12-problem-statement)
  - [1.3 Objectives of the Study](#13-objectives-of-the-study)
  - [1.4 Significance of the Study](#14-significance-of-the-study)
  - [1.5 Scope and Limitation](#15-scope-and-limitation)
- [II. Review of Related Literature](#ii-review-of-related-literature)
  - [2.1 Blockchain Technology](#21-blockchain-technology)
  - [2.2 Consensus Mechanisms](#22-consensus-mechanisms)
  - [2.3 Security and Privacy](#23-security-and-privacy)
  - [2.4 Scalability](#24-scalability)
  - [2.5 Interoperability](#25-interoperability)
- [III. Methodology](#iii-methodology)
  - [3.1 Research Design](#31-research-design)
  - [3.2 System Architecture](#32-system-architecture)
  - [3.3 System Workflow](#33-system-workflow)
  - [3.4 Data Flow Process](#34-data-flow-process)
  - [3.5 Tools and Technologies](#35-tools-and-technologies)
  - [3.6 Evaluation Criteria](#36-evaluation-criteria)
- [IV. Results and Discussion](#iv-results-and-discussion)
  - [4.1 Overview of the Proposed System](#41-overview-of-the-proposed-system)
  - [4.2 System Architecture Output](#42-system-architecture-output)
  - [4.3 Functional Output of the System](#43-functional-output-of-the-system)
  - [4.4 Simulation of Auction Process](#44-simulation-of-auction-process)
  - [4.5 Evaluation Based on System Criteria](#45-evaluation-based-on-system-criteria)
  - [4.6 Discussion of Findings](#46-discussion-of-findings)
- [References](#references)

---

## Abstract

Traditional online auction systems rely on centralized platforms, which may raise concerns about transparency and fairness. This paper proposes **BlockBid**, a blockchain-based sealed-bid auction system that uses a commit-reveal protocol to protect bid confidentiality. Users submit a hashed bid during the commit phase, keeping the bid hidden from others. After the deadline, participants reveal their bids for verification. Smart contracts automatically determine the highest bidder and refund other participants. This study also discusses blockchain concepts such as consensus mechanisms, security and privacy, scalability, and interoperability that support the system.

---

## I. Introduction

### 1.1 Background of the Study

Online auction systems allow users to buy and sell items through digital platforms. Most existing systems are centralized, meaning a single authority manages the bidding process and determines the winner. This setup may raise concerns regarding fairness, transparency, and data security.

Blockchain technology provides a decentralized approach where transactions are verified by multiple nodes instead of a central authority. This improves transparency and reduces the risk of manipulation. In auction systems, protecting the confidentiality of bids is also important because revealing bids early may influence other participants.

To address this issue, the commit-reveal protocol can be used. In this approach, users first submit a hashed version of their bid. The actual bid remains hidden until the reveal phase. After the bidding period ends, users reveal their original bids, and the system verifies them. This study proposes **BlockBid**, a blockchain-based sealed-bid auction system that ensures fairness and transparency while protecting the privacy of participants.

### 1.2 Problem Statement

Traditional auction platforms rely on centralized control, which may lead to concerns about transparency, fairness, and data privacy. In addition, open bidding systems may expose bid values before the auction ends.

This study aims to explore how blockchain technology can be used to create a secure sealed-bid auction system. It focuses on protecting bid confidentiality, ensuring fair winner selection, and automating the auction process using smart contracts.

### 1.3 Objectives of the Study

The main objective of this study is to design **BlockBid**, a blockchain-based sealed-bid auction system.

Specifically, the study aims to:

1. Design a decentralized auction system using blockchain.
2. Apply the commit-reveal protocol to protect bid privacy.
3. Use smart contracts to determine the winner automatically.
4. Analyze the system based on consensus mechanisms, security and privacy, scalability, and interoperability.

### 1.4 Significance of the Study

This study highlights how blockchain technology can improve transparency and security in online auction systems. By using a decentralized platform and cryptographic methods, the proposed system helps protect bid confidentiality and reduce the risk of manipulation.

The proposed BlockBid system may benefit users by providing a fair and secure auction process. It can also serve as a reference for researchers and developers who are interested in applying blockchain technology to decentralized applications.

### 1.5 Scope and Limitation

**Scope:**

This study focuses on designing and evaluating BlockBid, a blockchain-based sealed-bid auction system. The system emphasizes the use of the commit-reveal protocol to ensure bid confidentiality and smart contracts to automate the auction process. The study examines key blockchain aspects such as consensus mechanisms, security and privacy, scalability, and interoperability to support the system. The research primarily targets online auctions involving digital or physical items where confidentiality and fairness are critical.

**Limitation:**

The proposed system is limited to a conceptual design and simulation; actual deployment on a live blockchain network is not included in this study. The system does not account for network latency or transaction fees on public blockchains, which may affect real-world performance. Additionally, the study focuses on sealed-bid auctions only and does not cover other auction types such as English or Dutch auctions. User interface design and user experience testing are not part of this research.

---

## II. Review of Related Literature

### 2.1 Blockchain Technology

Blockchain is a distributed ledger technology that records transactions across multiple nodes in a network. Each transaction is grouped into blocks and secured using cryptographic hashes. Once recorded, the data cannot easily be modified, ensuring transparency and integrity.

Blockchain systems often use smart contracts, which automatically execute rules and agreements when certain conditions are met. This allows decentralized applications to operate without intermediaries.

### 2.2 Consensus Mechanisms

Consensus mechanisms are protocols that allow nodes in a blockchain network to agree on the validity of transactions. Common examples include Proof of Work (PoW) and Proof of Stake (PoS). These mechanisms help maintain the accuracy and consistency of the blockchain ledger.

In a blockchain-based auction system, consensus ensures that bid submissions and reveal transactions are verified and recorded correctly.

### 2.3 Security and Privacy

Blockchain systems rely on cryptographic techniques such as hashing and digital signatures to secure transactions. In sealed-bid auctions, protecting bid confidentiality is essential.

The commit-reveal protocol allows users to submit a hashed bid during the commit phase. The actual bid remains hidden until the reveal phase, where the original bid and secret value are disclosed for verification.

### 2.4 Scalability

Scalability refers to the ability of a blockchain network to handle increasing numbers of transactions efficiently. As more users participate in a system, the network must process transactions without significant delays. Techniques such as Layer-2 solutions and improved consensus methods help improve scalability.

### 2.5 Interoperability

Interoperability refers to the ability of different blockchain networks to communicate and exchange information. This allows decentralized applications to operate across multiple platforms. In the future, interoperability may enable blockchain-based auction systems to interact with various blockchain ecosystems.

---

## III. Methodology

### 3.1 Research Design

This study follows a design and simulation-based research approach. It focuses on developing a conceptual model of BlockBid, a blockchain-based sealed-bid auction system. The system is not deployed in a real blockchain environment but is instead analyzed through structured design, workflow modeling, and scenario-based evaluation.

### 3.2 System Architecture

The proposed BlockBid system is composed of the following components:

- **User Interface Layer** – Allows users to submit bids and reveal them during the appropriate phase.
- **Smart Contract Layer** – Handles bid commitments, verification, winner selection, and refunds.
- **Blockchain Network Layer** – Stores all transactions in a decentralized and immutable ledger.

The system operates without a central authority. All auction rules are enforced through smart contracts deployed on the blockchain.

### 3.3 System Workflow

The BlockBid system follows a commit-reveal protocol divided into three main phases:

**1. Commit Phase**

- Users submit a hashed version of their bid along with a secret value.
- The hash is stored on the blockchain.
- Actual bid values remain hidden during this phase.

**2. Reveal Phase**

- After the commit deadline, users reveal their original bid and secret value.
- The system verifies the hash using the revealed data.
- Invalid or mismatched bids are rejected.

**3. Winner Selection and Refund**

- The smart contract identifies the highest valid bid.
- The highest bidder is declared the winner.
- All other participants automatically receive refunds.

### 3.4 Data Flow Process

The process flow of the system can be summarized as follows:

1. User registers and joins an auction.
2. User submits a hashed bid (commit).
3. Blockchain records the transaction.
4. User reveals the original bid (reveal phase).
5. Smart contract verifies the bid.
6. System determines the winner.
7. Refunds are issued automatically.

### 3.5 Tools and Technologies

The proposed system is based on commonly used blockchain technologies:

- **Blockchain Platform (Conceptual):** Ethereum-like environment.
- **Smart Contracts:** Solidity (conceptual use).
- **Hashing Algorithm:** SHA-256.
- **Development Approach:** Simulation and system modeling.

### 3.6 Evaluation Criteria

The system is evaluated based on the following criteria:

- **Security and Privacy** – Protection of bid confidentiality using hashing.
- **Fairness** – Equal opportunity for all participants without early bid exposure.
- **Transparency** – Public verification of transactions on the blockchain.
- **Scalability** – Ability to handle multiple users and bids.
- **Interoperability** – Potential to integrate with other blockchain platforms.

---

## IV. Results and Discussion

### 4.1 Overview of the Proposed System

This study presents **BlockBid**, a blockchain-based sealed-bid auction system designed to enhance fairness, transparency, and bid confidentiality. The system utilizes a commit-reveal protocol and smart contracts to automate auction processes without relying on a central authority.

The output of this study is a conceptual system model, including system workflow, architecture design, and transaction processes within a blockchain environment.

### 4.2 System Architecture Output

The proposed architecture consists of three main layers:

- **Presentation Layer** – Interface where users interact with the auction system.
- **Application Layer** – Smart contracts handling logic such as bid commitment, verification, and winner selection.
- **Blockchain Layer** – Decentralized ledger storing all transactions securely.

This architecture ensures that all operations are transparent, tamper-proof, and verifiable.

**Figure 4.2.1 System Architecture Diagram**

The Presentation Layer serves as the user interface where participants submit their bids and reveal them during the appropriate phase. This layer allows interaction between users and the system.

The Application Layer contains the smart contracts that manage the core logic of the auction. These include bid commitment through hashing, verification during the reveal phase, automatic winner selection, and refund processing for non-winning bidders.

The Blockchain Network Layer acts as the decentralized ledger where all transactions are recorded. It ensures transparency, immutability, and security of the auction process by storing all bid commitments and reveal transactions in a tamper-proof manner.

### 4.3 Functional Output of the System

The BlockBid system performs the following core functions:

- **Bid Commitment** – Users submit hashed bids to hide actual values.
- **Bid Reveal** – Users disclose their original bid and secret key.
- **Bid Verification** – System validates bids using hash comparison.
- **Winner Selection** – Smart contract determines the highest bidder.
- **Automatic Refund** – Non-winning bidders receive refunds.

These functions demonstrate how blockchain can automate and secure auction processes.

### 4.4 Simulation of Auction Process

To evaluate the system, a simulated auction scenario was conducted:

1. Multiple users submitted hashed bids during the commit phase.
2. Users revealed their bids after the deadline.
3. The smart contract verified all entries.
4. The highest valid bid was selected as the winner.

The simulation showed that:

- No bids were visible before the reveal phase.
- Invalid reveals were automatically rejected.
- The system correctly identified the winner.

### 4.5 Evaluation Based on System Criteria

The system was analyzed using the following criteria:

**Security and Privacy**

The use of hashing ensures that bid values remain confidential during the commit phase. Blockchain immutability prevents data tampering.

**Fairness**

All participants follow the same rules enforced by smart contracts, eliminating bias and manipulation.

**Transparency**

All transactions are recorded on the blockchain and can be verified by users.

**Scalability**

The system may experience performance limitations as the number of users increases. Optimization techniques are required for real-world deployment.

**Interoperability**

The system has the potential to integrate with other blockchain networks, although this was not implemented in the study.

### 4.6 Discussion of Findings

The results indicate that the BlockBid system successfully demonstrates how blockchain technology can improve traditional auction systems. The commit-reveal protocol effectively protects bid confidentiality, while smart contracts automate and enforce auction rules.

However, the study also highlights limitations such as scalability challenges and the absence of real blockchain deployment. These factors must be addressed in future implementations.

---

## References

[1] G. Tripathi, M. A. Ahad, and G. Casalino, "A Comprehensive Review of Blockchain technology: Underlying Principles and Historical Background with Future Challenges," _Decision Analytics Journal_, vol. 9, no. 1, p. 100344, 2023, doi: [https://doi.org/10.1016/j.dajour.2023.100344](https://doi.org/10.1016/j.dajour.2023.100344).

[2] M. Tahir, M. H. Sardaraz, Z. Muhammad, and S. Khan, "Blockchain smart contracts: Applications, challenges, and future trends," _Peer-to-Peer Networking and Applications_, vol. 14, pp. 2901–2925, 2021. doi: [https://doi.org/10.1007/s12083-021-01127-0](https://doi.org/10.1007/s12083-021-01127-0). [Available: [https://pmc.ncbi.nlm.nih.gov/articles/PMC8053233/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8053233/)]

[3] Z. Shi, C. de Laat, P. Grosso, and Z. Zhao, "Integration of Blockchain and Auction Models: A Survey, Some Applications, and Challenges," _IEEE Communications Surveys & Tutorials_, 2022. [Online]. Available: [https://arxiv.org/pdf/2110.12534](https://arxiv.org/pdf/2110.12534)

[4] O. Morad, "Bitcoin Layer Two Scaling Solutions: Lightening Payment Channels Network and Enabling Factors," _International Journal of Computer Science and Mobile Computing_, vol. 13, no. 1, pp. 1–15, Jan. 2024. [Online]. Available: [https://ijcsm.researchcommons.org/ijcsm/vol13/iss1/9/](https://ijcsm.researchcommons.org/ijcsm/vol13/iss1/9/)

[5] T. Li, H. Zheng, and X. Li, "A Blockchain-Based Sealed-Bid e-Auction Scheme with Smart Contract and Zero-Knowledge Proof," _Security and Communication Networks_, vol. 2021, p. 5523394, May 2021. doi: [https://doi.org/10.1155/2021/5523394](https://doi.org/10.1155/2021/5523394).

[6] N. Kushwaha, R. Agarwal, A. K. Tyagi, A. Gupta, and H. Bhardwaj, "The State of Ethereum Smart Contracts Security: Vulnerabilities, Countermeasures, and Tool Support," _Journal of Cybersecurity and Privacy_, vol. 2, no. 2, pp. 358–378, May 2022. doi: [https://doi.org/10.3390/jcp2020019](https://doi.org/10.3390/jcp2020019).

[7] H. S. Galal and A. M. Youssef, "Succinctly Verifiable Sealed-Bid Auction Smart Contract," in _Proc. ESORICS 2018 International Workshops_, Barcelona, Spain, Sep. 2018, pp. 3–19. doi: [https://doi.org/10.1007/978-3-030-00305-0_1](https://doi.org/10.1007/978-3-030-00305-0_1).

[8] G. A. F. Rebello et al., "A Survey on Blockchain Scalability: From Hardware to Layer-Two Protocols," _IEEE Communications Surveys & Tutorials_, vol. 26, no. 4, pp. 2411–2458, 2024. doi: [https://doi.org/10.1109/COMST.2024.3376252](https://doi.org/10.1109/COMST.2024.3376252).

[9] A. Belchior et al., "Interoperability in Blockchain: A Survey," _IEEE Transactions on Knowledge and Data Engineering_, vol. 35, no. 12, pp. 12923–12946, 2023. doi: [https://doi.org/10.1109/TKDE.2023.3275220](https://doi.org/10.1109/TKDE.2023.3275220).
