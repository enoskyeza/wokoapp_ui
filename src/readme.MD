Global state
Revision plan

Step 1:  Data Fetching Methods in Next.js
* We'll explore getServerSideProps and getStaticProps for fetching data at different stages.
* We'll examine how these methods can help manage data that needs to be available globally.

Step 2:  Leveraging React Context for State Sharing
* We'll revisit Context API and how it can be used effectively within Next.js for sharing state across components.
* We'll look into patterns like creating a global context provider to make data accessible throughout your application.

Step 3:  Utilizing Custom Hooks and State Management
* We'll delve into creating custom hooks in React to encapsulate state management logic and make it reusable across your application.
* We'll see how this approach can help organize and manage state effectively without external libraries.


getServerSideProps

Imagine you're building a personalized news feed. You need to fetch the latest news articles tailored to the user's preferences every time they visit the page. This is where getServerSideProps comes in. This function runs on the server-side every time a user requests the page. It fetches the latest data and sends it to the page component as props.