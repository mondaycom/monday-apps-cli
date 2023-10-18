process.on('unhandledRejection', (err) => {
  console.log(err);
  throw new Error(
    "Got unhandled rejection (see above)! maybe you missed await on 'expect(..).rejects...' or 'expect(..).resolves...' ?"
  );
});
