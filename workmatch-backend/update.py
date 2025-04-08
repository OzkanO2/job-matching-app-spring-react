const invalidCompanyIds = [];

db.jobOffers.find().forEach(function(offer) {
  const companyId = offer.companyId;
  const companyUser = db.users.findOne({ _id: companyId, userType: "COMPANY" });
  if (!companyUser) {
    invalidCompanyIds.push(companyId.str);
  }
});

if (invalidCompanyIds.length === 0) {
  print("✅ Tous les companyId sont valides et appartiennent à des users COMPANY.");
} else {
  print("❌ CompanyId invalides détectés:");
  invalidCompanyIds.forEach(function(id) {
    print("- " + id);
  });
}
