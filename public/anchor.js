(function () {
window.anchor = {
 AnchorProvider: class {
 constructor(connection, wallet, opts) {
   this.connection = connection;
   this.wallet = wallet;
   this.opts = opts;
 }
 },
 Program: class {
 constructor(idl, programId, provider) {
   this.idl = idl;
   this.programId = programId;
   this.provider = provider;
 }
 methods(method) {
   return {
     accounts: (accs) => ({
       instruction: () => ({
         programId: this.programId,
         keys: Object.entries(accs).map(([name, pubkey]) => ({ pubkey, isSigner: false, isWritable: true })),
         data: Buffer.from([0]) // Dummy data
       })
     })
   };
 }
 },
 BN: class {
 constructor(value) {
   this.value = BigInt(value);
 }
 },
 setProvider: function (provider) {
 this.provider = provider;
 }
};
})();
