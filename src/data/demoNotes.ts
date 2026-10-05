import { StudyNote } from '../types/notes';

export const DEMO_STUDY_NOTE: StudyNote = {
  id: 'demo-os-sync-01',
  title: 'Process Synchronization & Deadlock Management in Operating Systems',
  subject: 'Operating Systems (CSE-301)',
  topic: 'Process Synchronization, Semaphores & Deadlock Handling',
  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  createdAt: Date.now() - 3600000 * 2,
  noteLength: 'Detailed',
  difficulty: 'Medium',
  purpose: 'Exam Preparation',
  format: 'Exam Notes',
  language: 'English',
  isFavorite: true,
  rawMaterialPreview: `Operating Systems Notes: Process Synchronization is the coordination of execution of multiple processes in a multi-programming environment so that concurrent access to shared data does not lead to inconsistent data state. The Critical Section Problem requires Mutual Exclusion, Progress, and Bounded Waiting. Peterson's solution solves this for 2 processes. Semaphores (Counting and Binary) provide signaling mechanisms using wait() and signal(). Classical problems include Producer-Consumer, Readers-Writers, and Dining Philosophers. Deadlocks occur when processes wait indefinitely for resources held by each other. Four necessary conditions (Coffman Conditions) are Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. Deadlock handling includes Prevention, Avoidance (Banker's Algorithm), Detection & Recovery, or Ignorance (Ostrich Algorithm).`,
  overview:
    'A high-yield examination guide covering Process Synchronization, the Critical Section Problem, Semaphore mechanisms, Classical IPC problems, and the 4 Coffman conditions for Deadlocks along with Banker\'s Algorithm prevention and avoidance strategies.',
  topics: [
    'Critical Section Problem & Requirements',
    'Peterson\'s Algorithm & Semaphores (Wait/Signal)',
    'Classical Synchronization Problems',
    'Deadlock Necessary Conditions (Coffman)',
    'Banker\'s Algorithm & Deadlock Avoidance'
  ],
  keyConcepts: [
    {
      heading: 'The Critical Section Problem',
      description: 'A critical section is a code segment where shared variables, tables, or files are accessed and updated concurrently.',
      points: [
        'Mutual Exclusion: If process Pi is executing in its critical section, no other process may execute in its critical section.',
        'Progress: If no process is executing in its critical section and some wish to enter, only processes not in remainder section can participate in the decision.',
        'Bounded Waiting: A bound must exist on the number of times other processes are allowed to enter their critical sections after a process has made a request.'
      ]
    },
    {
      heading: 'Semaphores (Dijkstra\'s Primitive)',
      description: 'A synchronization tool that does not require busy waiting (in blocked queue implementations). It is an integer variable accessed only via wait() [P] and signal() [V].',
      points: [
        'wait(S) [atomic]: Decrements S. If S becomes negative, the calling process is blocked.',
        'signal(S) [atomic]: Increments S. If S was <= 0, unblocks one waiting process from the semaphore queue.',
        'Binary Semaphore (Mutex): Value ranges between 0 and 1; used for mutual exclusion.',
        'Counting Semaphore: Value can range over an unrestricted domain; used to control access to a resource pool with finite instances.'
      ]
    },
    {
      heading: 'Deadlock & The Four Coffman Conditions',
      description: 'A state where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process.',
      points: [
        'Mutual Exclusion: At least one resource must be held in a non-shareable mode.',
        'Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources held by others.',
        'No Preemption: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it.',
        'Circular Wait: A closed chain of processes P0, P1, ..., Pn exists such that P0 waits for P1, P1 waits for P2, and Pn waits for P0.'
      ]
    },
    {
      heading: 'Deadlock Avoidance & Banker\'s Algorithm',
      description: 'Uses a priori information concerning the maximum amount of each resource type that each process will require, ensuring the system never enters an unsafe state.',
      points: [
        'Safe State: An execution sequence <P1, P2, ..., Pn> exists such that for each Pi, the resources Pi can still request can be satisfied by currently available resources plus resources held by all Pj (j < i).',
        'Data Structures: Available[m], Max[n][m], Allocation[n][m], Need[n][m] where Need[i][j] = Max[i][j] - Allocation[i][j].',
        'Safety Algorithm: Time complexity is O(m * n^2) to verify if granting a request leaves the system in a safe state.'
      ]
    }
  ],
  importantPoints: [
    'Race Condition occurs when multiple processes manipulate shared data concurrently and the outcome depends on the particular order of execution.',
    'Spinlocks are semaphores that utilize busy-waiting; acceptable only in multi-processor systems where context-switch overhead exceeds lock waiting duration.',
    'Deadlock Prevention invalidates at least one of the 4 Coffman conditions, whereas Deadlock Avoidance dynamically inspects resource allocation state.',
    'Banker\'s algorithm requires knowing the maximum claim of each process in advance, which is impractical in many modern general-purpose operating systems.'
  ],
  definitions: [
    {
      term: 'Race Condition',
      definition: 'A situation where multiple processes or threads concurrently read and write shared data, and the final result depends on the non-deterministic relative order of execution.',
      context: 'Multi-threaded and multi-process concurrency'
    },
    {
      term: 'Critical Section',
      definition: 'A portion of code in a multi-threaded program that accesses shared resources (memory, hardware, or files) and must not be concurrently accessed by more than one process.',
      context: 'Synchronization primitive design'
    },
    {
      term: 'Deadlock',
      definition: 'A permanent blocking state in an operating system where a set of processes are stalled because each process holds a resource needed by another process in the same set.',
      context: 'Resource management & scheduling'
    },
    {
      term: 'Safe State',
      definition: 'A state in which there exists at least one safe sequence of processes such that all processes can successfully complete their execution without deadlocking.',
      context: 'Banker\'s Algorithm avoidance'
    }
  ],
  formulas: [
    {
      name: 'Banker\'s Algorithm Need Matrix',
      formula: 'Need[i][j] = Max[i][j] - Allocation[i][j]',
      explanation: 'Determines the remaining resource instances of type j that process i may request before releasing its held instances.'
    },
    {
      name: 'Resource Allocation Condition for Safe State',
      formula: 'Need_i <= Work + Allocation_i',
      explanation: 'Work vector is initialized to Available; ensures currently available resources can satisfy remaining needs sequentially.'
    },
    {
      name: 'Deadlock-Free Resource Bound',
      formula: 'R >= sum(Max_i - 1) + 1',
      explanation: 'If total instances R exceeds the sum of (maximum need - 1) for all processes plus 1, deadlock can never occur.'
    }
  ],
  examples: [
    {
      concept: 'Producer-Consumer Problem (Bounded Buffer)',
      example: 'Producer places items into an array buffer of size N while Consumer removes items. Uses three semaphores: mutex (binary, 1) for buffer mutual exclusion, empty (counting, N) for available slots, and full (counting, 0) for occupied items.',
      explanation: 'Demonstrates combining binary and counting semaphores to coordinate asymmetric resource producers and consumers.'
    },
    {
      concept: 'Dining Philosophers Problem',
      example: 'Five philosophers sit around a circular table with 5 chopsticks. Each needs 2 chopsticks to eat. If all pick up their left chopstick simultaneously, circular wait occurs resulting in deadlock. Solved by asymmetric rule (odd philosophers pick left first, even pick right first) or an arbitrator.',
      explanation: 'Classic illustration of deadlock and starvation vulnerability in concurrent resource allocation.'
    }
  ],
  keywords: [
    'Critical Section',
    'Mutual Exclusion',
    'Race Condition',
    'Counting Semaphore',
    'Peterson Algorithm',
    'Coffman Conditions',
    'Banker\'s Algorithm',
    'Circular Wait',
    'Resource Allocation Graph (RAG)',
    'Safe Sequence'
  ],
  importantQuestions: [
    {
      id: 'demo-q1',
      type: '2-mark',
      marks: 2,
      question: 'What is a Race Condition? State how it can be prevented.',
      modelAnswer: 'A Race Condition is a flaw where concurrent threads access shared data and the final outcome depends on thread scheduling order. It is prevented by enforcing Mutual Exclusion using semaphores or mutex locks inside critical sections.',
      difficulty: 'Easy'
    },
    {
      id: 'demo-q2',
      type: '5-mark',
      marks: 5,
      question: 'List and explain the three essential requirements to solve the Critical Section Problem.',
      modelAnswer: 'The three requirements are:\n1. Mutual Exclusion: Only one process can execute in its critical section at a time.\n2. Progress: If no process is in its critical section, only processes wanting to enter can participate in selecting who enters next, preventing deadlocks.\n3. Bounded Waiting: A strict upper bound exists on how many times other processes can enter their critical section after a request is made, preventing process starvation.',
      difficulty: 'Medium'
    },
    {
      id: 'demo-q3',
      type: '10-mark',
      marks: 10,
      question: 'Explain the four Coffman conditions necessary for a Deadlock to occur. How does Deadlock Prevention eliminate them?',
      modelAnswer: 'A Deadlock occurs only if all 4 Coffman conditions hold simultaneously:\n\n1. Mutual Exclusion: At least one non-shareable resource. Elimination: Make resources shareable (read-only files), though physical devices like printers cannot be shared.\n2. Hold and Wait: A process holds resources while requesting more. Elimination: Require a process to request all resources at once before execution, or release all held resources before requesting new ones.\n3. No Preemption: Held resources cannot be forcibly seized. Elimination: If a process requests an unavailable resource, preempt all its current resources and restart when everything is available.\n4. Circular Wait: P0 waits for P1, P1 waits for P2... Pn waits for P0. Elimination: Impose a strict global numerical ordering on all resource types (F: R -> N) and enforce that processes can only request resources in strictly increasing numerical order.',
      difficulty: 'Difficult'
    }
  ],
  mcqs: [
    {
      id: 'demo-mcq1',
      question: 'Which of the following is NOT an essential requirement for a valid solution to the critical section problem?',
      options: ['Mutual Exclusion', 'Progress', 'Bounded Waiting', 'Preemptive Priority'],
      correctIndex: 3,
      explanation: 'Preemptive Priority is a CPU scheduling policy, not a requirement for the Critical Section Problem. The three canonical requirements are Mutual Exclusion, Progress, and Bounded Waiting.'
    },
    {
      id: 'demo-mcq2',
      question: 'In the Banker\'s Algorithm, if the Need matrix entry for process Pi is [2, 1, 3] and Available vector is [1, 2, 2], can Pi immediately be granted its maximum requirement?',
      options: ['Yes, because Available has enough resources', 'No, because Available resources for type 1 and 3 are insufficient', 'Yes, by preempting other processes', 'Only if Pi is executed in user mode'],
      correctIndex: 1,
      explanation: 'Need [2, 1, 3] requires 2 of type 1 and 3 of type 3, but Available has only 1 of type 1 and 2 of type 3. Since Need <= Available fails, Pi cannot be safely allocated.'
    },
    {
      id: 'demo-mcq3',
      question: 'Which deadlock handling technique invalidates the Circular Wait condition by imposing a total ordering on resource allocation?',
      options: ['Deadlock Avoidance', 'Deadlock Prevention', 'Ostrich Algorithm', 'Banker\'s Algorithm'],
      correctIndex: 1,
      explanation: 'Deadlock Prevention works by structurally denying at least one of the 4 Coffman conditions. In particular, linear resource ordering invalidates circular wait.'
    }
  ]
};

export const SAMPLE_STUDY_MATERIALS = [
  {
    subject: 'Operating Systems',
    topic: 'Process Synchronization & Deadlocks',
    content: `Process Synchronization is the coordination of execution of multiple processes in a multi-programming environment so that concurrent access to shared data does not lead to inconsistent data state.
When two or more processes read and write shared data concurrently, a Race Condition can occur where the output depends on execution order.
The Critical Section Problem requires three conditions to be satisfied:
1. Mutual Exclusion: If process Pi is executing in its critical section, then no other processes can be executing in their critical sections.
2. Progress: If no process is executing in its critical section and some processes wish to enter, only those processes that are not executing in their remainder sections can participate in deciding which will enter next.
3. Bounded Waiting: There must be a bound or limit on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter.
Peterson's solution is a classic software solution for 2 processes using flag[2] boolean array and turn integer variable.
Semaphores were introduced by Edsger Dijkstra. A semaphore S is an integer variable accessed only via two standard atomic operations: wait() [P] and signal() [V].
wait(S) { while (S <= 0); S--; }
signal(S) { S++; }
In modern operating systems, semaphores are implemented with a waiting queue to prevent CPU busy-waiting (spinlocks).
A Deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by another process.
The four necessary Coffman conditions for Deadlock are:
1. Mutual Exclusion: non-shareable resources.
2. Hold and Wait: holding at least one resource and requesting new ones.
3. No Preemption: resources cannot be taken away forcibly.
4. Circular Wait: closed chain of dependency P0 -> P1 -> P2 -> P0.
Deadlock management strategies:
1. Deadlock Prevention: Negate one of the four Coffman conditions (e.g. enforce linear ordering of resources to break Circular Wait).
2. Deadlock Avoidance: System dynamically evaluates state before granting resources (Banker's Algorithm using Available, Max, Allocation, Need where Need = Max - Allocation).
3. Deadlock Detection and Recovery: Allow deadlocks to occur, periodically run detection algorithm (Resource Allocation Graph cycle detection), and recover by process termination or resource preemption.
4. Deadlock Ignorance: The Ostrich algorithm used by Linux and Windows when deadlocks are rare.`
  },
  {
    subject: 'Database Management Systems',
    topic: 'Normalization & Normal Forms (1NF, 2NF, 3NF, BCNF)',
    content: `Database Normalization is the systematic approach of organizing data in a database to reduce data redundancy and improve data integrity.
Redundancies lead to Insertion, Deletion, and Modification anomalies.
Functional Dependency (FD): X -> Y means value of X uniquely determines Y.
Normal Forms:
1. First Normal Form (1NF): A relation is in 1NF if every attribute contains only atomic (indivisible) values and there are no repeating groups.
2. Second Normal Form (2NF): A relation is in 2NF if it is in 1NF and every non-prime attribute is fully functionally dependent on the candidate key (No partial dependency).
3. Third Normal Form (3NF): A relation is in 3NF if it is in 2NF and there is no transitive dependency of non-prime attributes on the primary key. Formally, for every non-trivial FD X -> A, either X is a superkey or A is a prime attribute.
4. Boyce-Codd Normal Form (BCNF): Stricter than 3NF. For every non-trivial functional dependency X -> A, X MUST be a superkey.
Decomposition must be Lossless Join Decomposition (R1 join R2 = R) and preferably preserve Functional Dependencies.
Lossless join test: R1 ∩ R2 -> R1 or R1 ∩ R2 -> R2.`
  },
  {
    subject: 'Computer Networks',
    topic: 'TCP/IP vs OSI Model and Congestion Control',
    content: `The OSI (Open Systems Interconnection) reference model is an ISO standard theoretical 7-layer architecture:
1. Physical Layer: Transmission of raw bit streams over physical medium.
2. Data Link Layer: Framing, physical addressing (MAC), error detection (CRC), flow control.
3. Network Layer: Logical addressing (IP), routing (OSPF, BGP), packet forwarding.
4. Transport Layer: End-to-end communication, port addressing, segmentation, reliability (TCP vs UDP).
5. Session Layer: Dialog control, token management, synchronization.
6. Presentation Layer: Translation, compression, encryption/decryption (SSL/TLS).
7. Application Layer: High-level protocols (HTTP, DNS, SMTP, FTP).
The TCP/IP model is the practical 4-layer suite used on the Internet: Link, Internet, Transport, Application.
TCP (Transmission Control Protocol) is connection-oriented, reliable, with 3-way handshake (SYN, SYN-ACK, ACK) and 4-way termination (FIN, ACK, FIN, ACK).
TCP Congestion Control phases:
1. Slow Start: Congestion Window (cwnd) starts at 1 MSS and doubles every RTT (exponential growth) until it reaches slow start threshold (ssthresh).
2. Congestion Avoidance: Once cwnd >= ssthresh, cwnd increases linearly by 1 MSS per RTT.
3. Fast Retransmit: Upon receiving 3 duplicate ACKs, TCP immediately retransmits missing packet without waiting for retransmission timer (RTO).
4. Fast Recovery: cwnd is set to ssthresh + 3 MSS, preventing dropping back to 1 MSS.`
  }
];
