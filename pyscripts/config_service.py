from suds.client import Client

class ConfigService(object):

    def __init__(self):
        self.client = Client("http://localhost:8081/config-service/ConfigurationService?wsdl")

    def clearCertificates(self):
        response = self.client.service.listCertificates(0, 99)
        ids = [r.id for r in response]
        if len(ids) > 0:
            result = self.client.service.removeCertificates(ids)

    def clearTrustBundles(self):
        response = self.client.service.getTrustBundles();
        ids = [r.id for r in response]
        if len(ids) > 0:
            self.client.service.deleteTrustBundles(ids)

