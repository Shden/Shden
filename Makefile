SUNWAIT = sunwait
SHC = shc

.PHONY: build

build:
	$(MAKE) -C $(SUNWAIT)
	$(MAKE) -C $(SHC)
	cp $(SUNWAIT)/sunwait $(SHC)/bin

clean:
	$(MAKE) -C $(SUNWAIT) clean
	$(MAKE) -C $(SHC) clean
