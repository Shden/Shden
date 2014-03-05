SUNWAIT = sunwait
SHC = shc

.PHONY: build

build:
	$(MAKE) -C $(SUNWAIT)
	$(MAKE) -C $(SHC)
clean:
	$(MAKE) -C $(SUNWAIT) clean
	$(MAKE) -C $(SHC) clean
